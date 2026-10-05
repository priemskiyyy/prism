import { NETWORK_LATENCIES } from "examples/shared/courier/constants/networkLatencies";
import {
  ASSISTANT_ROLLOUTS,
  COMPOSER_ROLLOUTS,
} from "examples/shared/courier/constants/rollouts";
import type { AssistantRollout } from "examples/shared/courier/types/AssistantRollout";
import type { ComposerRollout } from "examples/shared/courier/types/ComposerRollout";
import type { NetworkLatency } from "examples/shared/courier/types/NetworkLatency";
import { formatLatency } from "src/formatting/formatLatency";
import type { Option } from "src/types/Option";
import {
  ASSISTANT_ROLLOUT_LABELS,
  COMPOSER_ROLLOUT_LABELS,
} from "src/utils/constants/labels";

export const LATENCY_OPTIONS: Option<NetworkLatency>[] = NETWORK_LATENCIES.map(
  (latency) => ({ value: latency, label: formatLatency(latency) }),
);

export const COMPOSER_ROLLOUT_OPTIONS: Option<ComposerRollout>[] =
  COMPOSER_ROLLOUTS.map((rollout) => ({
    value: rollout,
    label: COMPOSER_ROLLOUT_LABELS[rollout],
  }));

export const ASSISTANT_ROLLOUT_OPTIONS: Option<AssistantRollout>[] =
  ASSISTANT_ROLLOUTS.map((rollout) => ({
    value: rollout,
    label: ASSISTANT_ROLLOUT_LABELS[rollout],
  }));
