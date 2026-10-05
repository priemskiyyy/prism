import type { TimelineEntry } from "examples/shared/courier/types/TimelineEntry";

export type TimelineEvent = TimelineEntry & { id: number; at: number };
