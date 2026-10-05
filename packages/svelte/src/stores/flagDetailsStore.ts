import type { FlagDetails, FlagHandle, JsonValue } from "@priemskiyyy/prism";
import type { Readable } from "svelte/store";
import { getFlagHandle } from "src/stores/internal/getFlagHandle";
import { observableStore } from "src/stores/internal/observableStore";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function flagDetailsStore<T>(
  handle: FlagHandle<T>,
): Readable<FlagDetails<T>>;
export function flagDetailsStore<T, Selection>(
  handle: FlagHandle<T>,
  select: (value: FlagDetails<T>) => Selection,
): Readable<Selection>;
export function flagDetailsStore<K extends RegisteredKey>(
  key: K,
): Readable<FlagDetails<RegisteredValue<K>>>;
export function flagDetailsStore<K extends RegisteredKey, Selection>(
  key: K,
  select: (value: FlagDetails<RegisteredValue<K>>) => Selection,
): Readable<Selection>;

export function flagDetailsStore(
  source: FlagHandle<JsonValue> | RegisteredKey,
  select?: (value: FlagDetails<JsonValue>) => unknown,
): Readable<unknown> {
  return observableStore(getFlagHandle(source).details, select);
}
