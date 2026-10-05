import type { FlagDefinition, FlagHandle } from "@priemskiyyy/prism";

export type DevtoolsFlag = {
  key: string;
  handle: FlagHandle<unknown>;
  definition: FlagDefinition;
};
