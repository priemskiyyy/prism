import type { PostHog } from "posthog-js";
import { createFlagAdapter, PrismError } from "@priemskiyyy/prism";
import type { Evaluation, FlagAdapter } from "@priemskiyyy/prism";
import { FEATURE_FLAG_OPTIONS } from "src/utils/constants/featureFlagOptions";

export type PostHogResource = {
  flag: string;
  select: "enabled" | "variant" | "payload";
};

export type PostHogOptions<C> = {
  client: PostHog;
  userId: (context: C) => string;
  resources: Record<string, PostHogResource>;
};

const getResourceEvaluation = (
  client: PostHog,
  resource: PostHogResource,
): Evaluation | undefined => {
  const result = client.getFeatureFlagResult(
    resource.flag,
    FEATURE_FLAG_OPTIONS,
  );

  if (result === undefined) {
    return undefined;
  }

  const selected = {
    enabled: result.enabled,
    variant: result.variant,
    payload: result.payload,
  } satisfies Record<PostHogResource["select"], unknown>;

  const value = selected[resource.select];

  if (value === undefined) {
    return undefined;
  }

  return { value, variant: result.variant };
};

export const posthog = <C>({
  client,
  userId,
  resources,
}: PostHogOptions<C>): FlagAdapter<C> => {
  const resourcesByKey = new Map(Object.entries(resources));

  return createFlagAdapter({
    name: "posthog",
    open: ({ invalidate }) => ({
      identify: () => {},
      read: ({ context, flags }) => {
        const expected = userId(context);
        const actual = client.get_distinct_id();

        if (actual !== expected) {
          throw new PrismError({
            code: "CONTEXT_CONFLICT",
            message: `PostHog identifies "${actual}" while the context expects "${expected}".`,
          });
        }

        const evaluations = new Map<string, Evaluation>();

        for (const { key } of flags) {
          const resource = resourcesByKey.get(key);

          if (resource === undefined) {
            throw new PrismError({
              code: "INVALID_CONFIGURATION",
              message: `Declare a PostHog resource for the flag "${key}".`,
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
      dispose: client.onFeatureFlags(invalidate),
    }),
  });
};
