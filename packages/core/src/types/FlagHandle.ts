import type { FlagDetails } from "src/types/FlagDetails";
import type { ObservableValue } from "src/types/ObservableValue";
import type { Unsubscribe } from "src/types/Unsubscribe";

export type FlagHandle<T> = ObservableValue<T> & {
  key: string;
  providerKey: string;
  details: ObservableValue<FlagDetails<T>>;
  override(value: T): Unsubscribe;
};
