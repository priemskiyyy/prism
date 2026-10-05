import { createContext } from "solid-js";
import type { Accessor } from "solid-js";
import type { RegisteredPrism } from "src/types/Register";

export const PrismContext = createContext<Accessor<RegisteredPrism>>();
