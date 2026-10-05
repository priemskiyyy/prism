import {
  computed,
  getCurrentInstance,
  onMounted,
  shallowRef,
  watch,
} from "vue";
import type { ComputedRef } from "vue";
import type { ObservableValue } from "@priemskiyyy/prism";

export function useObservableValue<T>(
  observable: () => ObservableValue<T>,
): ComputedRef<T> {
  if (!getCurrentInstance()) {
    throw new Error("Prism composables must run during component setup.");
  }

  const value = shallowRef(observable().get());

  onMounted(() => {
    watch(
      observable,
      (current, _previous, onCleanup) => {
        let active = true;

        let unsubscribe = () => {};

        onCleanup(() => {
          active = false;
          unsubscribe();
        });

        const release = current.subscribe(() => {
          if (active) {
            value.value = current.get();
          }
        });

        if (!active) {
          release();

          return;
        }

        unsubscribe = release;
        value.value = current.get();
      },
      { immediate: true, flush: "sync" },
    );
  });

  return computed(() => value.value);
}
