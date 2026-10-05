import { createFlagAdapter } from "src/createFlagAdapter";
import { createDeferred } from "src/internal/createDeferred";
import type { AdapterObserver } from "src/types/AdapterObserver";
import type { Evaluations } from "src/types/Evaluations";
import type { FlagAdapter } from "src/types/FlagAdapter";
import type { JsonObject } from "src/types/JsonObject";
import type { ReadRequest } from "src/types/ReadRequest";

export type MockRead<C> = {
  request: ReadRequest<C>;
  settled: boolean;
  resolve(evaluations?: Evaluations): void;
  reject(error: unknown): void;
};

export type MockIdentify<C> = {
  context: C;
  settled: boolean;
  resolve(): void;
  reject(error: unknown): void;
};

export type MockController<C> = {
  reads: MockRead<C>[];
  identifies: MockIdentify<C>[];
  opens: number;
  disposals: number;
  observers: number;
  invalidate(): void;
};

export type MockAdapterOptions<C> = {
  evaluate?: (request: ReadRequest<C>) => Evaluations;
  manualReads?: boolean;
  manualIdentifies?: boolean;
  onDispose?: () => void | Promise<void>;
};

const createSettlement = <T>() => {
  const { promise, resolve, reject } = createDeferred<T>();

  let settled = false;

  return {
    promise,
    isSettled: () => settled,
    resolve: (value: T) => {
      settled = true;
      resolve(value);
    },
    reject: (error: unknown) => {
      settled = true;
      reject(error);
    },
  };
};

const noEvaluations = (): Evaluations => ({});

export const createMockAdapter = <C = JsonObject>({
  evaluate = noEvaluations,
  manualReads = false,
  manualIdentifies = false,
  onDispose = () => {},
}: MockAdapterOptions<C> = {}): FlagAdapter<C> & {
  controller: MockController<C>;
} => {
  const observers = new Set<AdapterObserver>();
  const reads: MockRead<C>[] = [];
  const identifies: MockIdentify<C>[] = [];
  let opens = 0;
  let disposals = 0;

  const controller: MockController<C> = {
    reads,
    identifies,
    get opens() {
      return opens;
    },
    get disposals() {
      return disposals;
    },
    get observers() {
      return observers.size;
    },
    invalidate: () => {
      for (const observer of [...observers]) {
        observer.invalidate();
      }
    },
  };

  const adapter = createFlagAdapter<C>({
    name: "mock",
    open: (observer) => {
      opens += 1;
      observers.add(observer);

      return {
        identify: (context) => {
          const settlement = createSettlement<void>();

          const identify: MockIdentify<C> = {
            context,
            get settled() {
              return settlement.isSettled();
            },
            resolve: () => settlement.resolve(),
            reject: settlement.reject,
          };

          identifies.push(identify);

          if (!manualIdentifies) {
            identify.resolve();
          }

          return settlement.promise;
        },
        read: (request) => {
          const settlement = createSettlement<Evaluations>();

          const read: MockRead<C> = {
            request,
            get settled() {
              return settlement.isSettled();
            },
            resolve: (evaluations = evaluate(request)) =>
              settlement.resolve(evaluations),
            reject: settlement.reject,
          };

          reads.push(read);

          if (!manualReads) {
            read.resolve();
          }

          return settlement.promise;
        },
        dispose: () => {
          disposals += 1;
          observers.delete(observer);

          return onDispose();
        },
      };
    },
  });

  return { ...adapter, controller };
};
