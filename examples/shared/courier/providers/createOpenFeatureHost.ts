import { InMemoryProvider, OpenFeature } from "@openfeature/web-sdk";
import type { EvaluationContext, JsonValue } from "@openfeature/web-sdk";
import { openFeature } from "@priemskiyyy/prism-openfeature-web";
import { COURIER_CONTEXTS } from "examples/shared/courier/constants/courierContexts";
import { OPENFEATURE_DOMAIN } from "examples/shared/courier/constants/endpoints";
import { getMembershipKey } from "examples/shared/courier/directory/getMembershipKey";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";
import { noUpdates } from "examples/shared/courier/utils/noUpdates";
import { reportError } from "examples/shared/courier/utils/reportError";

type VariantTable = {
  variants: Map<string, JsonValue>;
  variantsByMembership: Map<string, string>;
};

const getVariantTables = (backend: FlagBackend) => {
  const tables = new Map<string, VariantTable>();

  for (const context of COURIER_CONTEXTS) {
    for (const [key, { value, variant }] of backend.evaluate(context)) {
      const table = tables.get(key) ?? {
        variants: new Map<string, JsonValue>(),
        variantsByMembership: new Map<string, string>(),
      };

      table.variants.set(variant, value);
      table.variantsByMembership.set(getMembershipKey(context), variant);
      tables.set(key, table);
    }
  }

  return tables;
};

const getOpenFeatureFlags = (backend: FlagBackend) =>
  Object.fromEntries(
    [...getVariantTables(backend)].map(
      ([key, { variants, variantsByMembership }]) => {
        const [defaultVariant = "none"] = variants.keys();

        return [
          key,
          {
            variants: Object.fromEntries(variants),
            defaultVariant,
            disabled: false,
            contextEvaluator: ({ targetingKey = "" }: EvaluationContext) =>
              variantsByMembership.get(targetingKey) ?? defaultVariant,
          },
        ];
      },
    ),
  );

export const createOpenFeatureHost = (backend: FlagBackend): ProviderHost => {
  const provider = new InMemoryProvider(getOpenFeatureFlags(backend));
  const ready = OpenFeature.setProviderAndWait(OPENFEATURE_DOMAIN, provider);

  backend.onPush(() => {
    provider.putConfiguration(getOpenFeatureFlags(backend)).catch(reportError);
  });

  const client = OpenFeature.getClient(OPENFEATURE_DOMAIN);

  return {
    id: "OPENFEATURE",
    ready,
    createAdapter: () =>
      openFeature<CourierContext>({
        client,
        context: (context) => ({
          targetingKey: getMembershipKey(context),
          ...context,
        }),
      }),
    updates: noUpdates,
  };
};
