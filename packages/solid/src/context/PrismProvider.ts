import { createComponent, createMemo } from "solid-js";
import type { ParentProps } from "solid-js";
import { PrismContext } from "src/context/PrismContext";
import type { RegisteredPrism } from "src/types/Register";

export type PrismProviderProps = ParentProps<{
  flags: RegisteredPrism;
}>;

export const PrismProvider = (props: PrismProviderProps) =>
  createComponent(PrismContext.Provider, {
    value: createMemo(() => props.flags),
    get children() {
      return props.children;
    },
  });
