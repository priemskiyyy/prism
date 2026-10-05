import { invokeIsolated } from "src/internal/invokeIsolated";
import type { Notify } from "src/internal/publish";
import type { ObservableValue } from "src/types/ObservableValue";
import type { Unsubscribe } from "src/types/Unsubscribe";

type Listener<T> = (value: T) => void | Promise<unknown>;

const noop = () => {};

export class ValueStore<T> {
  #value: T;
  #listeners = new Set<Listener<T>>();
  #closed = false;

  constructor(value: T) {
    this.#value = value;
  }

  observable: ObservableValue<T> = {
    get: () => this.#value,
    subscribe: (listener) => this.#register((value) => listener(value)),
  };

  select<U>(project: (value: T) => U): ObservableValue<U> {
    return {
      get: () => project(this.#value),
      subscribe: (listener) => {
        let current = project(this.#value);

        return this.#register((value) => {
          const next = project(value);

          if (Object.is(next, current)) {
            return;
          }

          current = next;

          return listener(next);
        });
      },
    };
  }

  set(next: T): Notify {
    if (this.#closed || Object.is(next, this.#value)) {
      return noop;
    }

    this.#value = next;

    const listeners = [...this.#listeners];

    return () => {
      for (const listener of listeners) {
        if (this.#closed || this.#value !== next) {
          return;
        }

        if (this.#listeners.has(listener)) {
          invokeIsolated(() => listener(next));
        }
      }
    };
  }

  close() {
    this.#closed = true;
    this.#listeners.clear();
  }

  #register(registration: Listener<T>): Unsubscribe {
    if (this.#closed) {
      return noop;
    }

    this.#listeners.add(registration);

    return () => {
      this.#listeners.delete(registration);
    };
  }
}
