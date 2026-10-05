import type { Unsubscribe } from "src/types/Unsubscribe";

export type ObservableValue<T> = {
  get: () => T;
  subscribe: (listener: (value: T) => void | Promise<unknown>) => Unsubscribe;
};
