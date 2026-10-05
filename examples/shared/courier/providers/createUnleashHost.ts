import { unleash } from "@priemskiyyy/prism-unleash";
import { InMemoryStorageProvider, UnleashClient } from "unleash-proxy-client";
import type { IToggle } from "unleash-proxy-client";
import { UNLEASH_URL } from "examples/shared/courier/constants/endpoints";
import { UNLEASH_RESOURCES } from "examples/shared/courier/constants/unleashResources";
import { findCourierContext } from "examples/shared/courier/directory/findCourierContext";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderEvaluation } from "examples/shared/courier/types/ProviderEvaluation";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import { noUpdates } from "examples/shared/courier/utils/noUpdates";
import { reportError } from "examples/shared/courier/utils/reportError";

const getUnleashToggles = (
  evaluations: Map<string, ProviderEvaluation>,
): IToggle[] =>
  [...evaluations].map(([name, { value, variant }]) => ({
    name,
    enabled: typeof value === "boolean" ? value : true,
    impressionData: false,
    variant: {
      name: variant,
      enabled: true,
      payload: { type: "json", value: JSON.stringify(value) },
    },
  }));

export const createUnleashHost = (backend: FlagBackend): ProviderHost => {
  const fetch = (url: string, init?: RequestInit) => {
    const parameters = new URL(url).searchParams;

    const context = findCourierContext(
      parameters.get("userId"),
      parameters.get("properties[workspaceId]"),
    );

    return backend.exchange(
      {
        provider: "Unleash proxy",
        method: "GET",
        path: "/api/frontend",
        context,
        signal: init?.signal,
      },
      () =>
        Response.json({
          toggles:
            context === undefined
              ? []
              : getUnleashToggles(backend.evaluate(context)),
        }),
    );
  };

  const client = new UnleashClient({
    url: UNLEASH_URL,
    clientKey: "courier-frontend",
    appName: "courier",
    disableMetrics: true,
    disableRefresh: true,
    storageProvider: new InMemoryStorageProvider(),
    fetch,
  });

  const ready = client.start();

  backend.onPush(() => {
    client.updateToggles().catch(reportError);
  });

  return {
    id: "UNLEASH",
    ready,
    createAdapter: () =>
      unleash<CourierContext>({
        client,
        context: ({ userId, workspaceId, role, plan, region }) => ({
          userId,
          properties: { workspaceId, role, plan, region },
        }),
        resources: UNLEASH_RESOURCES,
      }),
    updates: noUpdates,
  };
};
