import { ErrorCode, OpenFeature, ProviderStatus } from "@openfeature/web-sdk";
import type {
  Client,
  EvaluationContext,
  EvaluationDetails,
  FlagValue,
} from "@openfeature/web-sdk";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { DeclaredFlag, Evaluation, FlagAdapter } from "@priemskiyyy/prism";
import { CHANGE_EVENTS } from "src/utils/constants/changeEvents";
import { ERROR_CODES } from "src/utils/constants/errorCodes";

export type OpenFeatureOptions<C> = {
  client: Client;
  context: (context: C) => EvaluationContext;
};

const setDomainContext = (client: Client, context: EvaluationContext) => {
  const domain = client.metadata.domain;

  if (domain === undefined) {
    return OpenFeature.setContext(context);
  }

  return OpenFeature.setContext(domain, context);
};

const getFeatureFlagDetails = (
  client: Client,
  { key, fallback }: DeclaredFlag,
): EvaluationDetails<FlagValue> => {
  if (typeof fallback === "boolean") {
    return client.getBooleanDetails(key, fallback);
  }

  if (typeof fallback === "number") {
    return client.getNumberDetails(key, fallback);
  }

  if (typeof fallback === "string") {
    return client.getStringDetails(key, fallback);
  }

  return client.getObjectDetails(key, fallback);
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
    name: "openfeature-web",
    open: ({ invalidate }) => {
      for (const event of CHANGE_EVENTS) {
        client.addHandler(event, invalidate);
      }

      return {
        identify: async (context) => {
          await setDomainContext(client, toContext(context));

          if (client.providerStatus !== ProviderStatus.ERROR) {
            return;
          }

          throw new PrismError({
            code: "EVALUATION_FAILED",
            message: "The OpenFeature provider could not apply the context.",
          });
        },
        read: ({ flags }) => {
          const evaluations = new Map<string, Evaluation>();

          for (const flag of flags) {
            const evaluation = getNormalizedFeatureFlagValue(
              getFeatureFlagDetails(client, flag),
            );

            if (evaluation === undefined) {
              continue;
            }

            evaluations.set(flag.key, evaluation);
          }

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
