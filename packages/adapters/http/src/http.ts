import { createFlagAdapter } from "@priemskiyyy/prism";
import type { Evaluations, FlagAdapter, JsonObject } from "@priemskiyyy/prism";

export type HttpRequest<C> = {
  context: C;
  keys: string[];
  signal: AbortSignal;
};

export type HttpOptions<C> = {
  request: (request: HttpRequest<C>) => Evaluations | Promise<Evaluations>;
};

export const http = <C = JsonObject>({
  request,
}: HttpOptions<C>): FlagAdapter<C> =>
  createFlagAdapter({
    name: "http",
    open: () => ({
      identify: () => {},
      read: ({ context, flags, signal }) =>
        request({ context, keys: flags.map((flag) => flag.key), signal }),
      dispose: () => {},
    }),
  });
