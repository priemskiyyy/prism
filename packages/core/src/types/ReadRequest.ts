import type { DeclaredFlag } from "src/types/DeclaredFlag";

export type ReadRequest<C> = {
  context: C;
  flags: DeclaredFlag[];
  signal: AbortSignal;
};
