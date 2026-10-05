import { PrismError, toPrismError } from "src/PrismError";
import { createDeferred } from "src/internal/createDeferred";
import type { Deferred } from "src/internal/createDeferred";
import type { FlagRecord } from "src/internal/FlagRecord";
import { invokeIsolated } from "src/internal/invokeIsolated";
import { isJsonEqual } from "src/internal/json";
import { publish } from "src/internal/publish";
import type { Notify } from "src/internal/publish";
import { reportUnhandledError } from "src/internal/reportUnhandledError";
import type { ValueStore } from "src/internal/ValueStore";
import type { DeclaredFlag } from "src/types/DeclaredFlag";
import type { Evaluation } from "src/types/Evaluation";
import type { FlagSession } from "src/types/FlagSession";
import type { PrismStatus } from "src/types/PrismStatus";
import type { Unsubscribe } from "src/types/Unsubscribe";

type ConnectionOptions<C> = {
  session: FlagSession<C>;
  context: C;
  records: FlagRecord[];
  status: ValueStore<PrismStatus>;
  updates: (context: C, refresh: () => void) => Unsubscribe;
  timeout: number;
};

type Read = {
  controller: AbortController;
  timer: ReturnType<typeof setTimeout>;
  adapterCalled: boolean;
  done: Deferred<void>;
};

type ReadResult = Map<string, Evaluation> | PrismError;

const noop = () => {};

const cancelRead = (read: Read) => {
  clearTimeout(read.timer);
  read.controller.abort();
};

export class Connection<C> {
  #session: FlagSession<C>;
  #context: C;
  #records: FlagRecord[];
  #declaredFlags: DeclaredFlag[];
  #status: ValueStore<PrismStatus>;
  #updates: (context: C, refresh: () => void) => Unsubscribe;
  #timeout: number;
  #identity: Promise<void> = Promise.resolve();
  #identityFailed = false;
  #read: Read | undefined;
  #next: Deferred<void> | undefined;
  #stopUpdates: Unsubscribe = noop;
  #closed = false;

  constructor({
    session,
    context,
    records,
    status,
    updates,
    timeout,
  }: ConnectionOptions<C>) {
    this.#session = session;
    this.#context = context;
    this.#records = records;
    this.#declaredFlags = records.map((record) => record.declared);
    this.#status = status;
    this.#updates = updates;
    this.#timeout = timeout;
  }

  start(): Promise<void> {
    const context = this.#context;

    this.#identify(context);

    const loading = this.#load([]);

    this.#subscribeUpdates(context);

    return loading;
  }

  apply(context: C): Promise<void> {
    if (isJsonEqual(context, this.#context)) {
      return this.#joinActiveRead();
    }

    return this.#replace(context);
  }

  refresh(): Promise<void> {
    return this.#requestRead();
  }

  invalidate() {
    if (this.#closed) {
      return;
    }

    this.#requestRead().catch(noop);
  }

  close(): Promise<void> {
    this.#closed = true;

    const stopping = Promise.resolve().then(() =>
      invokeIsolated(this.#stopUpdates),
    );

    const disposing = this.#identity
      .catch(noop)
      .then(() => this.#session.dispose());

    const { read, next } = this.#detachReads();
    const disposed = new PrismError({ code: "DISPOSED" });

    if (read !== undefined) {
      cancelRead(read);
      read.done.reject(disposed);
    }

    next?.reject(disposed);

    return Promise.all([stopping, disposing]).then(noop);
  }

  #joinActiveRead(): Promise<void> {
    if (this.#read !== undefined) {
      return this.#read.done.promise;
    }

    if (this.#status.observable.get().state === "ready") {
      return Promise.resolve();
    }

    return this.#requestRead();
  }

  #replace(context: C): Promise<void> {
    const { read, next } = this.#detachReads();

    this.#context = context;
    this.#identify(context);

    const loading = this.#load(this.#records.map((record) => record.reset()));

    if (read !== undefined) {
      cancelRead(read);
      read.done.resolve();
    }

    next?.resolve();
    this.#subscribeUpdates(context);

    return loading;
  }

  #identify(context: C) {
    const identity = this.#identity.catch(noop).then(() => {
      if (this.#context !== context) {
        return;
      }

      return this.#session.identify(context);
    });

    identity.catch(() => {
      if (this.#identity === identity) {
        this.#identityFailed = true;
      }
    });
    this.#identity = identity;
    this.#identityFailed = false;
  }

  #load(notify: Notify[]): Promise<void> {
    const loading = this.#publishStatus({ state: "loading" });
    const done = createDeferred<void>();
    const refreshing = this.#startRead(done);

    publish([...notify, loading, refreshing]);

    return done.promise;
  }

  #subscribeUpdates(context: C) {
    const isCurrent = () => !this.#closed && this.#context === context;

    if (!isCurrent()) {
      return;
    }

    const stopPrevious = this.#stopUpdates;

    this.#stopUpdates = noop;
    invokeIsolated(stopPrevious);

    if (!isCurrent()) {
      return;
    }

    try {
      this.#stopUpdates = this.#updates(context, () => this.invalidate());
    } catch (error) {
      reportUnhandledError(error);
    }
  }

  #detachReads() {
    const read = this.#read;
    const next = this.#next;

    this.#read = undefined;
    this.#next = undefined;

    return { read, next };
  }

  #requestRead(): Promise<void> {
    const active = this.#read;

    if (active === undefined) {
      const done = createDeferred<void>();

      this.#startRead(done)();

      return done.promise;
    }

    if (!active.adapterCalled) {
      return active.done.promise;
    }

    if (this.#next === undefined) {
      this.#next = createDeferred<void>();
    }

    return this.#next.promise;
  }

  #startRead(done: Deferred<void>): Notify {
    const context = this.#context;
    const controller = new AbortController();

    const read: Read = {
      controller,
      done,
      adapterCalled: false,
      timer: setTimeout(() => {
        this.#settleRead(read, new PrismError({ code: "TIMEOUT" }));
        controller.abort();
      }, this.#timeout),
    };

    this.#read = read;

    if (this.#identityFailed) {
      this.#identify(context);
    }

    this.#identity
      .then(() => {
        if (controller.signal.aborted) {
          throw new Error(
            "The read was cancelled before the adapter was called.",
          );
        }

        read.adapterCalled = true;

        return this.#session.read({
          context,
          flags: this.#declaredFlags,
          signal: controller.signal,
        });
      })
      .then((evaluations) => new Map(Object.entries(evaluations)))
      .then(
        (evaluations) => this.#settleRead(read, evaluations),
        (cause: unknown) =>
          this.#settleRead(read, toPrismError(cause, "EVALUATION_FAILED")),
      );

    return this.#publishStatus(this.#status.observable.get());
  }

  #settleRead(read: Read, result: ReadResult) {
    if (this.#read !== read) {
      return;
    }

    clearTimeout(read.timer);
    this.#read = undefined;

    const next = this.#next;

    this.#next = undefined;

    const notify = this.#applyResult(result);

    if (next !== undefined) {
      notify.push(this.#startRead(next));
    }

    publish(notify);

    if (result instanceof PrismError) {
      read.done.reject(result);

      return;
    }

    read.done.resolve();
  }

  #applyResult(result: ReadResult): Notify[] {
    if (result instanceof PrismError) {
      return [this.#publishStatus({ state: "error", error: result })];
    }

    return [
      ...this.#records.map((record) => record.receive(result)),
      this.#publishStatus({ state: "ready" }),
    ];
  }

  #publishStatus(next: Omit<PrismStatus, "refreshing">): Notify {
    return this.#status.set(
      Object.freeze({ ...next, refreshing: this.#read !== undefined }),
    );
  }
}
