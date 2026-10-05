export type Evaluation =
  | { value: unknown; variant?: string | undefined; error?: never }
  | { error: unknown; value?: never; variant?: never };
