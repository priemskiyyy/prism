import type {
  LDContext,
  LDIdentifyOptions,
  LDIdentifyResult,
} from "@launchdarkly/js-client-sdk";

export type TestContext = { account: string };

type Identify = { context: LDContext; options: LDIdentifyOptions | undefined };

export const createFixture = () => {
  let flags: Record<string, unknown> = {};
  const identifies: Identify[] = [];
  const listeners = new Set<() => void>();
  let gate: ((result: LDIdentifyResult) => void) | undefined;
  let manual = false;

  const client = {
    identify: (
      context: LDContext,
      options?: LDIdentifyOptions,
    ): Promise<LDIdentifyResult> => {
      identifies.push({ context, options });

      const install = () => {
        flags = {
          enabled: Reflect.get(context, "key") === "A",
          nullable: null,
        };
      };

      if (!manual) {
        install();

        return Promise.resolve({ status: "completed" });
      }

      return new Promise((resolve) => {
        gate = (result) => {
          install();
          resolve(result);
        };
      });
    },
    allFlags: () => flags,
    on: (_event: "change", listener: () => void) => {
      listeners.add(listener);
    },
    off: (_event: "change", listener: () => void) => {
      listeners.delete(listener);
    },
  };

  return {
    client,
    identifies,
    context: (context: TestContext): LDContext => ({
      kind: "user",
      key: context.account,
    }),
    get listenerCount() {
      return listeners.size;
    },
    setManual: (value: boolean) => {
      manual = value;
    },
    settle: (result: LDIdentifyResult) => {
      gate?.(result);
      gate = undefined;
    },
    setValue: (value: unknown) => {
      flags = { ...flags, enabled: value };
    },
    emit: () => {
      for (const listener of listeners) {
        listener();
      }
    },
  };
};
