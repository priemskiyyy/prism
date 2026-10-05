import type { FlagAdapter, Unsubscribe } from "@priemskiyyy/prism";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";

export type ProviderHost = {
  id: ProviderId;
  ready: Promise<void>;
  createAdapter: () => FlagAdapter<CourierContext>;
  updates: (context: CourierContext, refresh: () => void) => Unsubscribe;
};
