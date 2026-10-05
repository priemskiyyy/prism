import { INITIAL_RULES } from "examples/shared/courier/constants/initialRules";
import { REQUEST_LOG_LENGTH } from "examples/shared/courier/constants/logLengths";
import { getMembershipKey } from "examples/shared/courier/directory/getMembershipKey";
import { evaluateCourierFlags } from "examples/shared/courier/rules/evaluateCourierFlags";
import type { BackendState } from "examples/shared/courier/types/BackendState";
import type { CourierRules } from "examples/shared/courier/types/CourierRules";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { NetworkExchange } from "examples/shared/courier/types/NetworkExchange";
import type { NetworkLatency } from "examples/shared/courier/types/NetworkLatency";
import type { NetworkRequest } from "examples/shared/courier/types/NetworkRequest";
import { createEventLog } from "examples/shared/courier/utils/createEventLog";
import { getRequestOutcome } from "examples/shared/courier/utils/getRequestOutcome";
import { wait } from "examples/shared/courier/utils/wait";

type FlagBackendOptions = { latency: NetworkLatency };

export const createFlagBackend = ({
  latency,
}: FlagBackendOptions): FlagBackend => {
  const listeners = new Set<() => void>();
  const pushListeners = new Set<() => void>();
  const requests = createEventLog<NetworkRequest>(REQUEST_LOG_LENGTH);

  let state: BackendState = {
    latency,
    offline: false,
    failNext: false,
    live: true,
    rules: INITIAL_RULES,
  };

  let nextRequestId = 1;

  const update = (next: BackendState) => {
    state = next;

    for (const listener of listeners) {
      listener();
    }
  };

  const push = () => {
    if (!state.live) {
      return;
    }

    for (const listener of pushListeners) {
      listener();
    }
  };

  const updateRules = (rules: CourierRules) => {
    update({ ...state, rules });
    push();
  };

  const takeFailure = () => {
    if (state.offline) {
      return new Response(null, { status: 503 });
    }

    if (!state.failNext) {
      return undefined;
    }

    update({ ...state, failNext: false });

    return new Response(null, { status: 503 });
  };

  const record = (
    { provider, method, path, context }: NetworkExchange,
    startedAt: number,
    response: Response | undefined,
  ) => {
    requests.add({
      id: nextRequestId,
      provider,
      method,
      path,
      membership: context === undefined ? undefined : getMembershipKey(context),
      status: response?.status,
      outcome: getRequestOutcome(response),
      duration: performance.now() - startedAt,
    });
    nextRequestId += 1;
  };

  return {
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot: () => state,
    requests: requests.log,
    evaluate: (context) => evaluateCourierFlags(context, state.rules),
    exchange: async (exchange, respond) => {
      const startedAt = performance.now();

      try {
        await wait(state.latency, exchange.signal);
      } catch (error) {
        record(exchange, startedAt, undefined);

        throw error;
      }

      const response = takeFailure() ?? respond();

      record(exchange, startedAt, response);

      return response;
    },
    onPush: (listener) => {
      pushListeners.add(listener);

      return () => {
        pushListeners.delete(listener);
      };
    },
    setLatency: (next) => {
      update({ ...state, latency: next });
    },
    setOffline: (offline) => {
      update({ ...state, offline });

      if (offline) {
        return;
      }

      push();
    },
    setLive: (live) => {
      update({ ...state, live });
      push();
    },
    failNextRequest: () => {
      update({ ...state, failNext: true });
    },
    setComposerRollout: (composerRollout) => {
      updateRules({ ...state.rules, composerRollout });
    },
    setAssistantRollout: (assistantRollout) => {
      updateRules({ ...state.rules, assistantRollout });
    },
    setMaintenance: (maintenance) => {
      updateRules({ ...state.rules, maintenance });
    },
    setCorruptChannels: (corruptChannels) => {
      updateRules({ ...state.rules, corruptChannels });
    },
  };
};
