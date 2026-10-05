import type {
  IMutableContext,
  IToggle,
  IVariant,
  UnleashClient,
} from "unleash-proxy-client";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";

export type UnleashResource = {
  toggle: string;
  select: "enabled" | "variant" | "payload";
};

export type UnleashOptions<C> = {
  client: UnleashClient;
  context: (context: C) => IMutableContext;
  resources: Record<string, UnleashResource>;
};

type Payload = NonNullable<IVariant["payload"]>;

const getPayloadValue = ({ type, value }: Payload): unknown => {
  if (type === "json" || type === "number") {
    return JSON.parse(value);
  }

  return value;
};

const getPayloadEvaluation = (variant: IVariant): Evaluation | undefined => {
  if (variant.payload === undefined) {
    return undefined;
  }

  try {
    return { value: getPayloadValue(variant.payload), variant: variant.name };
  } catch (cause) {
    return {
      error: new PrismError({
        code: "VALIDATION",
        message: `The "${variant.name}" payload is not valid ${variant.payload.type}.`,
        cause,
      }),
    };
  }
};

const getToggleEvaluation = (
  toggle: IToggle,
  resource: UnleashResource,
): Evaluation | undefined => {
  if (resource.select === "enabled") {
    return { value: toggle.enabled };
  }

  if (!toggle.variant.enabled) {
    return undefined;
  }

  if (resource.select === "variant") {
    return { value: toggle.variant.name, variant: toggle.variant.name };
  }

  return getPayloadEvaluation(toggle.variant);
};

export const unleash = <C>({
  client,
  context: toContext,
  resources,
}: UnleashOptions<C>): FlagAdapter<C> => {
  const resourcesByKey = new Map(Object.entries(resources));

  return createFlagAdapter({
    name: "unleash",
    open: ({ invalidate }) => {
      client.on("update", invalidate);

      return {
        identify: async (context) => {
          await client.updateContext(toContext(context));

          const error: unknown = client.getError();

          if (error === undefined) {
            return;
          }

          throw new PrismError({
            code: "NETWORK",
            message: "Unleash could not fetch the toggles for the context.",
            cause: error,
          });
        },
        read: ({ flags }) => {
          const toggles = new Map(
            client.getAllToggles().map((toggle) => [toggle.name, toggle]),
          );

          const evaluations = new Map<string, Evaluation>();

          for (const { key } of flags) {
            const resource = resourcesByKey.get(key);

            if (resource === undefined) {
              throw new PrismError({
                code: "INVALID_CONFIGURATION",
                message: `Declare an Unleash resource for the flag "${key}".`,
                key,
              });
            }

            const toggle = toggles.get(resource.toggle);

            if (toggle === undefined) {
              continue;
            }

            const evaluation = getToggleEvaluation(toggle, resource);

            if (evaluation === undefined) {
              continue;
            }

            evaluations.set(key, evaluation);
          }

          return Object.fromEntries(evaluations);
        },
        dispose: () => {
          client.off("update", invalidate);
        },
      };
    },
  });
};
