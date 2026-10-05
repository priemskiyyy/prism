import { COURIER_FLAG_KEYS } from "examples/shared/courier/constants/courierFlagKeys";
import { TIMELINE_LENGTH } from "examples/shared/courier/constants/logLengths";
import type { CourierPrism } from "examples/shared/courier/types/CourierPrism";
import type { EventLog } from "examples/shared/courier/types/EventLog";
import type { TimelineEntry } from "examples/shared/courier/types/TimelineEntry";
import type { TimelineEvent } from "examples/shared/courier/types/TimelineEvent";
import { createEventLog } from "examples/shared/courier/utils/createEventLog";

export const createTimeline = (
  flags: CourierPrism,
): EventLog<TimelineEvent> => {
  const { log, add } = createEventLog<TimelineEvent>(TIMELINE_LENGTH);
  let nextId = 1;

  const record = (entry: TimelineEntry) => {
    add({ ...entry, id: nextId, at: Date.now() });
    nextId += 1;
  };

  flags.status.subscribe((status) => {
    record({ kind: "STATUS", status });
  });

  for (const key of COURIER_FLAG_KEYS) {
    flags.flag(key).details.subscribe((details) => {
      record({ kind: "FLAG", key, details });
    });
  }

  return log;
};
