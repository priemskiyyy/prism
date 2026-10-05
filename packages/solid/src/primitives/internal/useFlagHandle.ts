import { useContext } from "solid-js";
import type { Accessor } from "solid-js";
import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { PrismContext } from "src/context/PrismContext";
import { getMissingProviderError } from "src/primitives/internal/getMissingProviderError";
import type { RegisteredKey } from "src/types/Register";

type FlagSource = FlagHandle<JsonValue> | RegisteredKey;

export const useFlagHandle = (source: FlagSource | Accessor<FlagSource>) => {
  const provided = useContext(PrismContext);

  return (): FlagHandle<JsonValue> => {
    const current = typeof source === "function" ? source() : source;

    if (typeof current !== "string") {
      return current;
    }

    if (provided === undefined) {
      throw getMissingProviderError(current);
    }

    return provided().flag(current);
  };
};
