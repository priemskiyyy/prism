import { useContext } from "react";
import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { PrismContext } from "src/context/PrismContext";
import { getMissingProviderError } from "src/hooks/internal/getMissingProviderError";
import type { RegisteredKey } from "src/types/Register";

export const useFlagHandle = (
  source: FlagHandle<JsonValue> | RegisteredKey,
): FlagHandle<JsonValue> => {
  const flags = useContext(PrismContext);

  if (typeof source !== "string") {
    return source;
  }

  if (flags === undefined) {
    throw getMissingProviderError(source);
  }

  return flags.flag(source);
};
