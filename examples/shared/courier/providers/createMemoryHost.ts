import { memory } from "@priemskiyyy/prism-memory";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";

export const createMemoryHost = (backend: FlagBackend): ProviderHost => ({
  id: "MEMORY",
  ready: Promise.resolve(),
  createAdapter: () =>
    memory<CourierContext>({
      values: (context) =>
        Object.fromEntries(
          [...backend.evaluate(context)].map(([key, { value }]) => [
            key,
            value,
          ]),
        ),
    }),
  updates: (_context, refresh) => backend.onPush(refresh),
});
