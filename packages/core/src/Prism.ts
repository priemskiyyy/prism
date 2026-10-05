import { PrismError } from "src/PrismError";
import { Connection } from "src/internal/Connection";
import { FlagRecord } from "src/internal/FlagRecord";
import { normalizeContext } from "src/internal/normalizeContext";
import { ValueStore } from "src/internal/ValueStore";
import type { FlagAdapter } from "src/types/FlagAdapter";
import type { FlagHandle } from "src/types/FlagHandle";
import type { FlagKey } from "src/types/FlagKey";
import type { FlagDefinitions } from "src/types/FlagDefinitions";
import type { InferFlag } from "src/types/InferFlag";
import type { ObservableValue } from "src/types/ObservableValue";
import type { PrismStatus } from "src/types/PrismStatus";
import type { Unsubscribe } from "src/types/Unsubscribe";
import {
  DEFAULT_READ_TIMEOUT,
  MAXIMUM_READ_TIMEOUT,
} from "src/utils/constants/readTimeout";
import {
  DISPOSED_PRISM_STATUS,
  IDLE_PRISM_STATUS,
} from "src/utils/constants/status";

export type PrismOptions<S extends FlagDefinitions, C> = {
  flags: S;
  adapter: FlagAdapter<C>;
  updates?: (context: C, refresh: () => void) => Unsubscribe;
  timeout?: number;
};

type ActiveState<C> =
  { phase: "IDLE" } | { phase: "STARTED"; connection: Connection<C> };
type State<C> = ActiveState<C> | { phase: "DISPOSED"; disposal: Promise<void> };

const noop = () => {};

const isReadTimeout = (timeout: number) =>
  timeout > 0 && timeout <= MAXIMUM_READ_TIMEOUT;

const createRecords = (flags: FlagDefinitions) => {
  const records = new Map<string, FlagRecord>();
  const providerKeys = new Set<string>();

  for (const [key, definition] of Object.entries(flags)) {
    const providerKey = definition.key ?? key;

    if (key.length === 0 || providerKey.length === 0) {
      throw new PrismError({
        code: "INVALID_CONFIGURATION",
        message: "Flag keys must be nonempty.",
        key,
      });
    }

    if (providerKeys.has(providerKey)) {
      throw new PrismError({
        code: "INVALID_CONFIGURATION",
        message: `Two flags resolve to the provider key "${providerKey}".`,
        key,
      });
    }

    providerKeys.add(providerKey);
    records.set(key, new FlagRecord(key, providerKey, definition));
  }

  return records;
};

export class Prism<S extends FlagDefinitions, C> {
  #adapter: FlagAdapter<C>;
  #updates: (context: C, refresh: () => void) => Unsubscribe;
  #timeout: number;
  #records: Map<string, FlagRecord>;
  #status = new ValueStore<PrismStatus>(IDLE_PRISM_STATUS);
  #state: State<C> = { phase: "IDLE" };

  status: ObservableValue<PrismStatus> = this.#status.observable;

  constructor({
    flags,
    adapter,
    updates = () => noop,
    timeout = DEFAULT_READ_TIMEOUT,
  }: PrismOptions<S, C>) {
    if (!isReadTimeout(timeout)) {
      throw new PrismError({
        code: "INVALID_CONFIGURATION",
        message: `The read timeout must be between 1 and ${MAXIMUM_READ_TIMEOUT} milliseconds.`,
      });
    }

    this.#adapter = adapter;
    this.#updates = updates;
    this.#timeout = timeout;
    this.#records = createRecords(flags);
  }

  flag<K extends FlagKey<S>>(key: K): FlagHandle<InferFlag<S[K]>>;
  flag(key: string): FlagHandle<unknown> {
    const record = this.#records.get(key);

    if (record === undefined) {
      throw new PrismError({
        code: "INVALID_CONFIGURATION",
        message: `The flag "${key}" is not declared.`,
        key,
      });
    }

    return record.handle;
  }

  async start({ context }: { context: C & object }): Promise<void> {
    const state = this.#getActiveState();
    const next = normalizeContext(context);

    if (state.phase === "STARTED") {
      return state.connection.apply(next);
    }

    const connection = new Connection<C>({
      session: this.#adapter.open({ invalidate: () => this.#invalidate() }),
      context: next,
      records: [...this.#records.values()],
      status: this.#status,
      updates: this.#updates,
      timeout: this.#timeout,
    });

    this.#state = { phase: "STARTED", connection };

    return connection.start();
  }

  async context(next: C & object): Promise<void> {
    return this.#getConnection().apply(normalizeContext(next));
  }

  async refresh(): Promise<void> {
    return this.#getConnection().refresh();
  }

  dispose(): Promise<void> {
    const state = this.#state;

    if (state.phase === "DISPOSED") {
      return state.disposal;
    }

    const disposal = this.#close(state);

    this.#state = { phase: "DISPOSED", disposal };
    this.#status.set(DISPOSED_PRISM_STATUS)();

    for (const record of this.#records.values()) {
      record.close();
    }

    this.#status.close();

    return disposal;
  }

  #close(state: ActiveState<C>): Promise<void> {
    if (state.phase === "IDLE") {
      return Promise.resolve();
    }

    return state.connection.close();
  }

  #invalidate() {
    const state = this.#state;

    if (state.phase !== "STARTED") {
      return;
    }

    state.connection.invalidate();
  }

  #getActiveState(): ActiveState<C> {
    const state = this.#state;

    if (state.phase === "DISPOSED") {
      throw new PrismError({ code: "DISPOSED" });
    }

    return state;
  }

  #getConnection(): Connection<C> {
    const state = this.#getActiveState();

    if (state.phase === "IDLE") {
      throw new PrismError({ code: "NOT_STARTED" });
    }

    return state.connection;
  }
}
