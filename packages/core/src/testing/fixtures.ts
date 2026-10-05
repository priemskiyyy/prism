import type { MockController } from "src/mock";
import type { StandardSchema } from "src/types/StandardSchema";

export const flushMicrotasks = async () => {
  for (let index = 0; index < 20; index += 1) {
    await Promise.resolve();
  }
};

export const readAt = <C>(controller: MockController<C>, index: number) => {
  const read = controller.reads[index];

  if (read === undefined) {
    throw new Error(
      `Expected read ${index}; observed ${controller.reads.length} reads.`,
    );
  }

  return read;
};

export const identifyAt = <C>(controller: MockController<C>, index: number) => {
  const identify = controller.identifies[index];

  if (identify === undefined) {
    throw new Error(
      `Expected identify ${index}; observed ${controller.identifies.length} identifies.`,
    );
  }

  return identify;
};

export const LayoutSchema: StandardSchema<"classic" | "compact"> = {
  "~standard": {
    version: 1,
    vendor: "test",
    validate: (value) => {
      if (value === "classic" || value === "compact") {
        return { value };
      }

      return { issues: [{ message: "Expected a supported layout." }] };
    },
  },
};
