import { useCallback } from "react";
import { useSyncExternalStoreWithSelector } from "use-sync-external-store/with-selector";
import type { ObservableValue } from "@priemskiyyy/prism";

export const useObservableValue = <T, Selection>(
  observable: ObservableValue<T>,
  selector?: (value: T) => Selection,
): T | Selection => {
  const subscribe = useCallback(
    (listener: () => void) => observable.subscribe(listener),
    [observable],
  );

  const getSnapshot = useCallback(() => observable.get(), [observable]);

  const select = (value: T): T | Selection =>
    selector === undefined ? value : selector(value);

  return useSyncExternalStoreWithSelector(
    subscribe,
    getSnapshot,
    getSnapshot,
    select,
    Object.is,
  );
};
