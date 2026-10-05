import { useSyncExternalStore } from "react";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";

export const useBackendState = (backend: FlagBackend) =>
  useSyncExternalStore(
    backend.subscribe,
    backend.getSnapshot,
    backend.getSnapshot,
  );
