import type { Evaluations } from "src/types/Evaluations";
import type { ReadRequest } from "src/types/ReadRequest";

export type FlagSession<C> = {
  identify: (context: C) => void | Promise<void>;
  read: (request: ReadRequest<C>) => Evaluations | Promise<Evaluations>;
  dispose: () => void | Promise<void>;
};
