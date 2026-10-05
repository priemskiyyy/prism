import type { PropsWithChildren } from "react";
import { PrismContext } from "src/context/PrismContext";
import type { RegisteredPrism } from "src/types/Register";

export type PrismProviderProps = PropsWithChildren<{
  flags: RegisteredPrism;
}>;

export const PrismProvider = ({ flags, children }: PrismProviderProps) => (
  <PrismContext.Provider value={flags}>{children}</PrismContext.Provider>
);
