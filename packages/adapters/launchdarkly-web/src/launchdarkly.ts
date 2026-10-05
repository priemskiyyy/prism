import type {
  LDContext,
  LDIdentifyOptions,
  LDIdentifyResult,
} from "@launchdarkly/js-client-sdk";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";
import { IDENTIFY_ERROR_CODES } from "src/utils/constants/identifyErrorCodes";
import { IDENTIFY_OPTIONS } from "src/utils/constants/identifyOptions";

export type LaunchDarklyClient = {
  allFlags(): Record<string, unknown>;
  identify(
    context: LDContext,
    options?: LDIdentifyOptions,
  ): Promise<LDIdentifyResult>;
  on(event: "change", listener: () => void): void;
  off(event: "change", listener: () => void): void;
};

export type LaunchDarklyOptions<C> = {
  client: LaunchDarklyClient;
  context: (context: C) => LDContext;
  hash?: (context: C) => string | Promise<string>;
};

export const launchdarkly = <C>({
  client,
  context: toContext,
  hash,
}: LaunchDarklyOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "launchdarkly-web",
    open: ({ invalidate }) => {
      client.on("change", invalidate);

      return {
        identify: async (context) => {
          const secureHash = await hash?.(context);

          const options =
            secureHash === undefined
              ? IDENTIFY_OPTIONS
              : { ...IDENTIFY_OPTIONS, hash: secureHash };

          const result = await client.identify(toContext(context), options);

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
