import { GrowthBook } from "@growthbook/growthbook";
import type { FeatureDefinition, FeatureRule } from "@growthbook/growthbook";
import { growthbook } from "@priemskiyyy/prism-growthbook";
import { COURIER_CONTEXTS } from "examples/shared/courier/constants/courierContexts";
import { getMembershipKey } from "examples/shared/courier/directory/getMembershipKey";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import { reportError } from "examples/shared/courier/utils/reportError";

const getGrowthBookFeatures = (backend: FlagBackend) => {
  const rules = new Map<string, FeatureRule[]>();

  for (const context of COURIER_CONTEXTS) {
    for (const [key, { value }] of backend.evaluate(context)) {
      rules.set(key, [
        ...(rules.get(key) ?? []),
        { condition: { membership: getMembershipKey(context) }, force: value },
      ]);
    }
  }

  return Object.fromEntries(
    [...rules].map(([key, featureRules]): [string, FeatureDefinition] => [
      key,
      { defaultValue: null, rules: featureRules },
    ]),
  );
};

export const createGrowthBookHost = (backend: FlagBackend): ProviderHost => {
  const client = new GrowthBook({ features: getGrowthBookFeatures(backend) });

  backend.onPush(() => {
    client
      .setPayload({ features: getGrowthBookFeatures(backend) })
      .catch(reportError);
  });

  return {
    id: "GROWTHBOOK",
    ready: Promise.resolve(),
    createAdapter: () =>
      growthbook<CourierContext>({
        client,
        attributes: (context) => ({
          id: context.userId,
          membership: getMembershipKey(context),
          ...context,
        }),
      }),
    updates: (_context, refresh) => {
      client.setRenderer(refresh);

      return () => {
        client.setRenderer(null);
      };
    },
  };
};
