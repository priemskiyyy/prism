import type { ObservableValue } from "@priemskiyyy/prism";
import { writable } from "svelte/store";
import type { Readable } from "svelte/store";

const selectStore = <T, Selection>(
  observable: ObservableValue<T>,
  select: (value: T) => Selection,
): Readable<Selection> => ({
  subscribe(run, invalidate) {
    let active = true;
    let current = select(observable.get());
    // Boxing keeps Svelte's primitive comparator from overriding our equality.
    const store = writable({ value: current });

    const update = () => {
      if (!active) {
        return;
      }

      const next = select(observable.get());

      if (Object.is(current, next)) {
        return;
      }

      current = next;
      store.set({ value: next });
    };

    const unsubscribe = observable.subscribe(update);

    try {
      // A custom observable can change while it registers the listener.
      update();

      const stop = store.subscribe(
        (snapshot) => run(snapshot.value),
        () => invalidate?.(),
      );

      return () => {
        if (!active) {
          return;
        }

        active = false;
        stop();
        unsubscribe();
      };
    } catch (error) {
      active = false;
      unsubscribe();
      throw error;
    }
  },
});

export const observableStore = <T, Selection>(
  observable: ObservableValue<T>,
  select?: (value: T) => Selection,
): Readable<T> | Readable<Selection> => {
  if (select === undefined) {
    return selectStore(observable, (value) => value);
  }

  return selectStore(observable, select);
};
