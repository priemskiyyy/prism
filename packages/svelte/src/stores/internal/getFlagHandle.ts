import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import { getPrism } from "src/context/getPrism";
import type { RegisteredKey } from "src/types/Register";

export const getFlagHandle = (
  source: FlagHandle<JsonValue> | RegisteredKey,
): FlagHandle<JsonValue> => {
  if (typeof source !== "string") {
    return source;
  }

  return getPrism(source).flag(source);
};
