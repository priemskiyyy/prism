import type { StatsigClient, StatsigUser } from "@statsig/js-client";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";
import { EVALUATION_OPTIONS } from "src/utils/constants/evaluationOptions";

export type StatsigResource =
  | { type: "gate"; name: string }
  | {
      type: "config" | "experiment" | "layer";
      name: string;
      parameter: string;
    };

export type StatsigOptions<C> = {
  client: StatsigClient;
  user: (context: C) => StatsigUser;
  resources: Record<string, StatsigResource>;
};

const isRecognizedReason = (reason: string) =>
  reason.endsWith(":Recognized") || reason === "LocalOverride";

const getResourceEvaluation = (
  client: StatsigClient,
  resource: StatsigResource,
): Evaluation | undefined => {
  if (resource.type === "gate") {
    const gate = client.getFeatureGate(resource.name, EVALUATION_OPTIONS);

    if (!isRecognizedReason(gate.details.reason)) {
      return undefined;
    }

    return { value: gate.value };
  }

  const read = {
    config: () => client.getDynamicConfig(resource.name, EVALUATION_OPTIONS),
    experiment: () => client.getExperiment(resource.name, EVALUATION_OPTIONS),
    layer: () => client.getLayer(resource.name, EVALUATION_OPTIONS),
  } satisfies Record<typeof resource.type, () => unknown>;

  const result = read[resource.type]();

  if (!isRecognizedReason(result.details.reason)) {
    return undefined;
  }

  const value: unknown = result.get(resource.parameter);

  if (value === undefined) {
    return undefined;
  }

  const groupName = "groupName" in result ? result.groupName : null;

  return { value, variant: groupName === null ? undefined : groupName };
};

export const statsig = <C>({
  client,
  user,
  resources,
}: StatsigOptions<C>): FlagAdapter<C> => {
  const resourcesByKey = new Map(Object.entries(resources));

  return createFlagAdapter({
    name: "statsig",
    open: ({ invalidate }) => {
      client.on("values_updated", invalidate);

      return {
        identify: async (context) => {
          await client.updateUserAsync(user(context));
        },
        read: ({ flags }) => {
          const evaluations = new Map<string, Evaluation>();

          for (const { key } of flags) {
            const resource = resourcesByKey.get(key);

            if (resource === undefined) {
              throw new PrismError({
                code: "INVALID_CONFIGURATION",
                message: `Declare a Statsig resource for the flag "${key}".`,
                key,
              });
            }

            const evaluation = getResourceEvaluation(client, resource);

            if (evaluation === undefined) {
              continue;
            }

            evaluations.set(key, evaluation);
          }

          return Object.fromEntries(evaluations);
        },
        dispose: () => {
          client.off("values_updated", invalidate);
        },
      };
    },
  });
};
