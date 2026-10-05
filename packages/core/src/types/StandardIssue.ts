export type StandardIssue = {
  message: string;
  path?: Iterable<PropertyKey | { key: PropertyKey }> | undefined;
};
