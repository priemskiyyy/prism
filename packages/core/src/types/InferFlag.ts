import type { FlagDefinition } from "src/types/FlagDefinition";

export type InferFlag<T> = T extends FlagDefinition<infer V> ? V : never;
