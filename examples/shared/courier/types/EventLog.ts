import type { Unsubscribe } from "@priemskiyyy/prism";

export type EventLog<T> = {
  subscribe: (listener: () => void) => Unsubscribe;
  getSnapshot: () => T[];
  clear: () => void;
};
