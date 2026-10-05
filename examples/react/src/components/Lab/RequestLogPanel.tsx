import type React from "react";
import { Eraser, Receipt } from "@phosphor-icons/react";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { Badge } from "src/components/Badge/Badge";
import { EmptyState } from "src/components/EmptyState/EmptyState";
import { Panel } from "src/components/Panel/Panel";
import { formatDuration } from "src/formatting/formatDuration";
import { useEventLog } from "src/hooks/useEventLog";
import { OUTCOME_LABELS } from "src/utils/constants/labels";
import { OUTCOME_TONES } from "src/utils/constants/outcomeTones";

type RequestLogPanelProps = { backend: FlagBackend };

export const RequestLogPanel: React.FunctionComponent<RequestLogPanelProps> = ({
  backend,
}) => {
  const requests = useEventLog(backend.requests);

  return (
    <Panel
      title="Network"
      icon={Receipt}
      shows="Requests the providers sent through the lab network, newest first."
      aside={
        <button
          type="button"
          disabled={requests.length === 0}
          onClick={backend.requests.clear}
          className={buttonStyles({ size: "small" })}
        >
          <Eraser aria-hidden="true" size={14} weight="bold" />
          Clear
        </button>
      }
    >
      {requests.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No requests yet"
          description="Your API, Unleash and Statsig send their requests through this network. Switch workspace to send one."
        />
      ) : (
        <ol
          aria-label="Requests"
          className="flex max-h-[28rem] flex-col divide-y divide-zinc-200/70 overflow-y-auto text-sm dark:divide-zinc-800"
        >
          {requests.map((request) => (
            <li
              key={request.id}
              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-2.5"
            >
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-mono">
                  <span className="font-semibold">{request.method}</span>{" "}
                  {request.path}
                </span>
                <span className="truncate text-zinc-500">
                  {request.provider} · {request.membership ?? "anonymous"}
                </span>
              </span>
              <Badge tone={OUTCOME_TONES[request.outcome]}>
                {request.status ?? OUTCOME_LABELS[request.outcome]}
              </Badge>
              <span className="w-16 text-right font-mono text-zinc-500 tabular-nums">
                {formatDuration(request.duration)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
};
