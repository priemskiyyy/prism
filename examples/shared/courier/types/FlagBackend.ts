import type { Unsubscribe } from "@priemskiyyy/prism";
import type { AssistantRollout } from "examples/shared/courier/types/AssistantRollout";
import type { BackendState } from "examples/shared/courier/types/BackendState";
import type { ComposerRollout } from "examples/shared/courier/types/ComposerRollout";
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import type { EventLog } from "examples/shared/courier/types/EventLog";
import type { NetworkExchange } from "examples/shared/courier/types/NetworkExchange";
import type { NetworkLatency } from "examples/shared/courier/types/NetworkLatency";
import type { NetworkRequest } from "examples/shared/courier/types/NetworkRequest";
import type { ProviderEvaluation } from "examples/shared/courier/types/ProviderEvaluation";

export type FlagBackend = {
  subscribe: (listener: () => void) => Unsubscribe;
  getSnapshot: () => BackendState;
  requests: EventLog<NetworkRequest>;
  evaluate: (context: CourierContext) => Map<string, ProviderEvaluation>;
  exchange: (
    exchange: NetworkExchange,
    respond: () => Response,
  ) => Promise<Response>;
  onPush: (listener: () => void) => Unsubscribe;
  setLatency: (latency: NetworkLatency) => void;
  setOffline: (offline: boolean) => void;
  setLive: (live: boolean) => void;
  failNextRequest: () => void;
  setComposerRollout: (rollout: ComposerRollout) => void;
  setAssistantRollout: (rollout: AssistantRollout) => void;
  setMaintenance: (maintenance: boolean) => void;
  setCorruptChannels: (corrupt: boolean) => void;
};
