import type { z } from "zod";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { backendChange } from "#src/requests";

export const applyBackendChange = (
  backend: FlagBackend,
  change: z.infer<typeof backendChange>,
) => {
  if (change.composerRollout !== undefined) {
    backend.setComposerRollout(change.composerRollout);
  }

  if (change.assistantRollout !== undefined) {
    backend.setAssistantRollout(change.assistantRollout);
  }

  if (change.maintenance !== undefined) {
    backend.setMaintenance(change.maintenance);
  }

  if (change.corruptChannels !== undefined) {
    backend.setCorruptChannels(change.corruptChannels);
  }

  if (change.offline !== undefined) {
    backend.setOffline(change.offline);
  }

  if (change.latency !== undefined) {
    backend.setLatency(change.latency);
  }

  if (change.failNext !== undefined) {
    backend.failNextRequest();
  }
};
