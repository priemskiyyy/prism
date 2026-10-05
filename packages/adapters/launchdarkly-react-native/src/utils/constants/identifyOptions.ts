import type { LDIdentifyOptions } from "@launchdarkly/react-native-client-sdk";

export const IDENTIFY_OPTIONS = {
  noTimeout: true,
  sheddable: false,
} satisfies LDIdentifyOptions;
