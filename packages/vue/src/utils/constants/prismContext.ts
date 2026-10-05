import type { ComputedRef, InjectionKey } from "vue";
import type { RegisteredPrism } from "src/types/Register";

export const PRISM_CONTEXT: InjectionKey<ComputedRef<RegisteredPrism>> =
  Symbol("prism");
