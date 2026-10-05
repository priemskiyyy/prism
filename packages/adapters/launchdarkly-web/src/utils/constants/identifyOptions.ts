import type { LDIdentifyOptions } from "@launchdarkly/js-client-sdk";

export const IDENTIFY_OPTIONS = {
  noTimeout: true,
  sheddable: false,
} satisfies LDIdentifyOptions;
