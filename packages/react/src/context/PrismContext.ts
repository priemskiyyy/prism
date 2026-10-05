import { createContext } from "react";
import type { RegisteredPrism } from "src/types/Register";

export const PrismContext = createContext<RegisteredPrism | undefined>(
  undefined,
);
