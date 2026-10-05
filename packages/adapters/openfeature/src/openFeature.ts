import { ErrorCode } from "@openfeature/server-sdk";
import type {
  Client,
  EvaluationContext,
  EvaluationDetails,
  FlagValue,
} from "@openfeature/server-sdk";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { DeclaredFlag, Evaluation, FlagAdapter } from "@priemskiyyy/prism";
import { CHANGE_EVENTS } from "src/utils/constants/changeEvents";
import { ERROR_CODES } from "src/utils/constants/errorCodes";

export type OpenFeatureOptions<C> = {
  client: Client;
  context: (context: C) => EvaluationContext;
};

const getFeatureFlagDetails = (
  client: Client,
  { key, fallback }: DeclaredFlag,
  context: EvaluationContext,
): Promise<EvaluationDetails<FlagValue>> => {
  if (typeof fallback === "boolean") {
    return client.getBooleanDetails(key, fallback, context);
  }

  if (typeof fallback === "number") {
    return client.getNumberDetails(key, fallback, context);
  }

  if (typeof fallback === "string") {
    return client.getStringDetails(key, fallback, context);
  }

  return client.getObjectDetails(key, fallback, context);
};

const getNormalizedFeatureFlagValue = (
  details: EvaluationDetails<FlagValue>,
): Evaluation | undefined => {
  if (details.errorCode === ErrorCode.FLAG_NOT_FOUND) {
    return undefined;
  }

  if (details.errorCode !== undefined || details.reason === "ERROR") {
    return {
      error: new PrismError({
        code: ERROR_CODES[details.errorCode ?? ErrorCode.GENERAL],
        key: details.flagKey,
        message: details.errorMessage,
      }),
    };
  }

  if (details.reason === "DEFAULT" || details.reason === "DISABLED") {
    return undefined;
  }

  return { value: details.value, variant: details.variant };
};

export const openFeature = <C>({
  client,
  context: toContext,
}: OpenFeatureOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "openfeature",
    open: ({ invalidate }) => {
      for (const event of CHANGE_EVENTS) {
        client.addHandler(event, invalidate);
      }

      return {
        identify: () => {},
        read: async ({ context, flags }) => {
          const evaluationContext = toContext(context);
          const evaluations = new Map<string, Evaluation>();

          await Promise.all(
            flags.map(async (flag) => {
              const evaluation = getNormalizedFeatureFlagValue(
                await getFeatureFlagDetails(client, flag, evaluationContext),
              );

              if (evaluation === undefined) {
                return;
              }

              evaluations.set(flag.key, evaluation);
            }),
          );

          return Object.fromEntries(evaluations);
        },
        dispose: () => {
          for (const event of CHANGE_EVENTS) {
            client.removeHandler(event, invalidate);
          }
        },
      };
    },
  });
