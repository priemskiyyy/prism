import { statsig } from "@priemskiyyy/prism-statsig";
import { StatsigClient } from "@statsig/js-client";
import type { EvaluationsDataAdapter } from "@statsig/js-client";
import { STATSIG_RESOURCES } from "examples/shared/courier/constants/statsigResources";
import { findCourierContext } from "examples/shared/courier/directory/findCourierContext";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderEvaluation } from "examples/shared/courier/types/ProviderEvaluation";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import { noUpdates } from "examples/shared/courier/utils/noUpdates";
import { reportError } from "examples/shared/courier/utils/reportError";

const getInitializeResponse = (
  evaluations: Map<string, ProviderEvaluation>,
) => {
  const featureGates = new Map<string, unknown>();
  const dynamicConfigs = new Map<string, unknown>();

  for (const [name, { value, variant }] of evaluations) {
    if (typeof value === "boolean") {
      featureGates.set(name, {
        name,
        value,
        rule_id: variant,
        secondary_exposures: [],
      });

      continue;
    }

    dynamicConfigs.set(name, {
      name,
      value: { value },
      rule_id: variant,
      group_name: variant,
      secondary_exposures: [],
    });
  }

  return {
    has_updates: true,
    time: Date.now(),
    hash_used: "none",
    feature_gates: Object.fromEntries(featureGates),
    dynamic_configs: Object.fromEntries(dynamicConfigs),
    layer_configs: {},
  };
};

export const createStatsigHost = (backend: FlagBackend): ProviderHost => {
  const dataAdapter = {
    attach: () => {},
    getDataSync: () => null,
    getDataAsync: async (_cached, user) => {
      const context = findCourierContext(
        user.userID,
        user.customIDs?.["workspaceID"],
      );

      const response = await backend.exchange(
        {
          provider: "Statsig",
          method: "POST",
          path: "/v1/initialize",
          context,
          signal: undefined,
        },
        () =>
          Response.json(
            getInitializeResponse(
              context === undefined ? new Map() : backend.evaluate(context),
            ),
          ),
      );

      if (!response.ok) {
        return null;
      }

      return {
        source: "Network",
        receivedAt: Date.now(),
        stableID: null,
        fullUserHash: null,
        data: await response.text(),
      };
    },
    prefetchData: async () => {},
    setData: () => {},
    setDataLegacy: () => {},
  } satisfies EvaluationsDataAdapter;

  const client = new StatsigClient(
    "client-courier",
    { userID: "" },
    {
      dataAdapter,
      loggingEnabled: "disabled",
      disableStorage: true,
      networkConfig: { preventAllNetworkTraffic: true },
    },
  );

  const ready = client.initializeAsync().then(() => {});

  backend.onPush(() => {
    client.updateUserAsync(client.getContext().user).catch(reportError);
  });

  return {
    id: "STATSIG",
    ready,
    createAdapter: () =>
      statsig<CourierContext>({
        client,
        user: ({ userId, workspaceId, role, plan, region }) => ({
          userID: userId,
          customIDs: { workspaceID: workspaceId },
          custom: { role, plan, region },
        }),
        resources: STATSIG_RESOURCES,
      }),
    updates: noUpdates,
  };
};
