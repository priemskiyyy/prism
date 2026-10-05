import type { FlagDefinitions } from "src/types/FlagDefinitions";

export type FlagKey<S extends FlagDefinitions> = Extract<keyof S, string>;
