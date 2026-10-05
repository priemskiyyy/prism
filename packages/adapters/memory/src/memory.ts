import { createFlagAdapter } from "@priemskiyyy/prism";
import type {
  Evaluation,
  FlagAdapter,
  JsonObject,
  JsonValue,
} from "@priemskiyyy/prism";

export type MemoryOptions<C> = {
  values: (context: C) => Record<string, JsonValue>;
};

export const memory = <C = JsonObject>({
  values,
}: MemoryOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "memory",
    open: () => ({
      identify: () => {},
      read: ({ context, flags }) => {
        const evaluated = new Map(Object.entries(values(context)));
        const evaluations = new Map<string, Evaluation>();

        for (const { key } of flags) {
          if (!evaluated.has(key)) {
            continue;
          }

          evaluations.set(key, { value: evaluated.get(key) });
        }

        return Object.fromEntries(evaluations);
      },
      dispose: () => {},
    }),
  });
