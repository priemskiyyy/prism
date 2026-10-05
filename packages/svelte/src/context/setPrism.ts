import { setContext } from "svelte";
import type { RegisteredPrism } from "src/types/Register";
import { PRISM_CONTEXT } from "src/utils/constants/prismContext";

export const setPrism = (flags: () => RegisteredPrism) => {
  setContext(PRISM_CONTEXT, flags);
};
