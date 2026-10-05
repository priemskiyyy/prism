import { expect } from "vitest";
import { createMockAdapter } from "src/mock";
import { testFlagAdapter } from "src/testing/testFlagAdapter";

testFlagAdapter<{ user: string }>({
  name: "mock",
  create: () => {
    const adapter = createMockAdapter<{ user: string }>({
      evaluate: ({ context }) => ({ enabled: { value: context.user === "a" } }),
    });

    return {
      adapter,
      context: { user: "a" },
      nextContext: { user: "b" },
      flags: [{ key: "enabled", fallback: false }],
      verify: (evaluations, context) => {
        expect(evaluations).toEqual({
          enabled: { value: context.user === "a" },
        });
      },
    };
  },
});
