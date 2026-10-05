import { Prism } from "@priemskiyyy/prism";
import { courierFlags } from "examples/shared/courier/flags";
import { createTimeline } from "examples/shared/courier/runtime/createTimeline";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { CourierRuntime } from "examples/shared/courier/types/CourierRuntime";
import type { ProviderHost } from "examples/shared/courier/types/ProviderHost";

export const createCourierRuntime = (
  host: ProviderHost,
  initialContext: CourierContext,
): CourierRuntime => {
  const flags = new Prism({
    flags: courierFlags,
    adapter: host.createAdapter(),
    updates: host.updates,
  });

  let context = initialContext;

  const isIdle = () => flags.status.get().state === "idle";

  return {
    provider: host.id,
    flags,
    timeline: createTimeline(flags),
    start: () => host.ready.then(() => flags.start({ context })),
    changeContext: (next) => {
      context = next;

      if (isIdle()) {
        return Promise.resolve();
      }

      return flags.context(next);
    },
    refresh: () => {
      if (isIdle()) {
        return Promise.resolve();
      }

      return flags.refresh();
    },
    dispose: () => flags.dispose(),
  };
};
