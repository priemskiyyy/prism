import type { StandardResult } from "src/types/StandardResult";

export type StandardSchema<T> = {
  "~standard": {
    version: 1;
    vendor: string;
    types?: { input: unknown; output: T } | undefined;
    validate: (
      value: unknown,
    ) => StandardResult<T> | PromiseLike<StandardResult<T>>;
  };
};
