import type {
  FlagDefinitions,
  FlagKey,
  InferFlag,
  Prism,
} from "@priemskiyyy/prism";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions, @typescript-eslint/no-empty-object-type -- declaration merging needs an interface.
export interface Register {}

type Registration = Register extends {
  prism: Prism<infer S extends FlagDefinitions, infer C>;
}
  ? { flags: S; context: C }
  : { flags: FlagDefinitions; context: unknown };

export type RegisteredFlags = Registration["flags"];

export type RegisteredContext = Registration["context"];

export type RegisteredPrism = Prism<RegisteredFlags, RegisteredContext>;

export type RegisteredKey = FlagKey<RegisteredFlags>;

export type RegisteredValue<K extends RegisteredKey> = InferFlag<
  RegisteredFlags[K]
>;
