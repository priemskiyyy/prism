import type { StandardIssue } from "src/types/StandardIssue";

export type StandardResult<T> =
  { value: T; issues?: undefined } | { issues: Iterable<StandardIssue> };
