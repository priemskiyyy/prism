import type {
  LDContext,
  LDIdentifyOptions,
  LDIdentifyResult,
} from "@launchdarkly/react-native-client-sdk";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";
import { IDENTIFY_ERROR_CODES } from "src/utils/constants/identifyErrorCodes";
import { IDENTIFY_OPTIONS } from "src/utils/constants/identifyOptions";

export type LaunchDarklyClient = {
  allFlags(): Record<string, unknown>;
  identifyResult(
    context: LDContext,
    options?: LDIdentifyOptions,
  ): Promise<LDIdentifyResult>;
  on(event: "change", listener: () => void): void;
  off(event: "change", listener: () => void): void;
};

export type LaunchDarklyOptions<C> = {
  client: LaunchDarklyClient;
  context: (context: C) => LDContext;
};

export const launchdarkly = <C>({
  client,
  context: toContext,
}: LaunchDarklyOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "launchdarkly-react-native",
    open: ({ invalidate }) => {
      client.on("change", invalidate);

      return {
        identify: async (context) => {
          const result = await client.identifyResult(
            toContext(context),
            IDENTIFY_OPTIONS,
          );

          if (result.status === "completed") {
            return;
          }

          throw new PrismError({
            code: IDENTIFY_ERROR_CODES[result.status],
            message: `LaunchDarkly identify ended with status "${result.status}".`,
            cause: result.status === "error" ? result.error : undefined,
          });
        },
        read: ({ flags }) => {
          const snapshot = new Map(Object.entries(client.allFlags()));
          const evaluations = new Map<string, Evaluation>();

          for (const { key } of flags) {
            if (!snapshot.has(key)) {
              continue;
            }

            evaluations.set(key, { value: snapshot.get(key) });
          }

          return Object.fromEntries(evaluations);
        },
        dispose: () => {
          client.off("change", invalidate);
        },
      };
    },
  });
