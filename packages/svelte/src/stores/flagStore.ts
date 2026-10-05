import type { FlagHandle, JsonValue } from "@priemskiyyy/prism";
import type { Readable } from "svelte/store";
import { getFlagHandle } from "src/stores/internal/getFlagHandle";
import { observableStore } from "src/stores/internal/observableStore";
import type { RegisteredKey, RegisteredValue } from "src/types/Register";

export function flagStore<T>(handle: FlagHandle<T>): Readable<T>;
export function flagStore<T, Selection>(
  handle: FlagHandle<T>,
  select: (value: T) => Selection,
): Readable<Selection>;
export function flagStore<K extends RegisteredKey>(
  key: K,
): Readable<RegisteredValue<K>>;
export function flagStore<K extends RegisteredKey, Selection>(
  key: K,
  select: (value: RegisteredValue<K>) => Selection,
): Readable<Selection>;

export function flagStore(
  source: FlagHandle<JsonValue> | RegisteredKey,
  select?: (value: JsonValue) => unknown,
): Readable<unknown> {
  return observableStore(getFlagHandle(source), select);
}
