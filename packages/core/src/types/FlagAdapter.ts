import type { AdapterObserver } from "src/types/AdapterObserver";
import type { FlagSession } from "src/types/FlagSession";
import type { JsonObject } from "src/types/JsonObject";

export type FlagAdapter<C = JsonObject> = {
  name: string;
  open: (observer: AdapterObserver) => FlagSession<C>;
};
