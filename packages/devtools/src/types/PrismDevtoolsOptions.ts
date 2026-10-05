import type { FlagDefinitions, Prism } from "@priemskiyyy/prism";

export type PrismDevtoolsOptions<S extends FlagDefinitions, C> = {
  flags: Prism<S, C>;
  definitions: S;
};
