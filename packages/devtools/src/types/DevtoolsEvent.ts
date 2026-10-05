import type { DevtoolsEntry } from "src/types/DevtoolsEntry";

export type DevtoolsEvent = DevtoolsEntry & { id: number; at: number };
