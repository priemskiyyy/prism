import type { Attributes, GrowthBook } from "@growthbook/growthbook";
import { createFlagAdapter } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";

export type GrowthBookOptions<C> = {
  client: GrowthBook;
  attributes: (context: C) => Attributes;
};

export const growthbook = <C>({
  client,
  attributes,
}: GrowthBookOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "growthbook",
    open: () => ({
      identify: (context) => client.setAttributes(attributes(context)),
      read: ({ flags }) => {
        const evaluations = new Map<string, Evaluation>();

        for (const { key } of flags) {
          const result = client.evalFeature(key);

          if (result.source === "unknownFeature") {
            continue;
          }

          evaluations.set(key, {
            value: result.value,
            variant: result.experimentResult?.key,
          });
        }

        return Object.fromEntries(evaluations);
      },
      dispose: () => {},
    }),
  });
