import { PrismError } from "@priemskiyyy/prism";

export const getMissingProviderError = (key?: string) =>
  new PrismError({
    code: "INVALID_CONFIGURATION",
    message: "Reading flags by key needs a PrismProvider above.",
    ...(key === undefined ? {} : { key }),
  });
