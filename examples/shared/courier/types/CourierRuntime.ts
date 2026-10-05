import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { CourierPrism } from "examples/shared/courier/types/CourierPrism";
import type { EventLog } from "examples/shared/courier/types/EventLog";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import type { TimelineEvent } from "examples/shared/courier/types/TimelineEvent";

export type CourierRuntime = {
  provider: ProviderId;
  flags: CourierPrism;
  timeline: EventLog<TimelineEvent>;
  start: () => Promise<void>;
  changeContext: (context: CourierContext) => Promise<void>;
  refresh: () => Promise<void>;
  dispose: () => Promise<void>;
};
