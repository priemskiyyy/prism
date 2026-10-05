import {
  createEffect,
  createSignal,
  getOwner,
  onCleanup,
  untrack,
} from "solid-js";
import type { Accessor } from "solid-js";
import type { ObservableValue } from "@priemskiyyy/prism";

export function useObservableValue<T>(
  observable: Accessor<ObservableValue<T>>,
): Accessor<T> {
  if (!getOwner()) {
    throw new Error("Prism primitives must run within a reactive owner.");
  }

  const [value, setValue] = createSignal(untrack(() => observable().get()));

  createEffect(() => {
    const current = observable();

    untrack(() => {
      let active = true;

      let unsubscribe = () => {};

      onCleanup(() => {
        active = false;
        unsubscribe();
      });

      const release = current.subscribe(() => {
        if (active) {
          setValue(() => current.get());
        }
      });

      if (!active) {
        release();

        return;
      }

      unsubscribe = release;
      setValue(() => current.get());
    });
  });

  return value;
}
