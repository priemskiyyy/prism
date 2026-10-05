import type React from "react";
import clsx from "clsx";
import {
  PLAN_LABELS,
  REGION_LABELS,
  ROLE_LABELS,
} from "examples/shared/courier/constants/labels";
import { WORKSPACES } from "examples/shared/courier/constants/workspaces";
import { getMemberships } from "examples/shared/courier/directory/getMemberships";
import type { Membership } from "examples/shared/courier/types/Membership";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { workspaceTabStyles } from "examples/shared/ui/styles/workspaceTabStyles";

type WorkspaceTabsProps = {
  membership: Membership;
  onWorkspaceSelect: (workspaceId: WorkspaceId) => void;
};

export const WorkspaceTabs: React.FunctionComponent<WorkspaceTabsProps> = ({
  membership,
  onWorkspaceSelect,
}) => (
  <div role="group" aria-label="Workspaces" className="flex min-w-0 gap-1.5">
    {getMemberships(membership.userId).map(({ workspaceId, role }) => {
      const workspace = WORKSPACES[workspaceId];
      const selected = workspaceId === membership.workspaceId;

      return (
        <button
          key={workspaceId}
          type="button"
          aria-pressed={selected}
          onClick={() => onWorkspaceSelect(workspaceId)}
          className={workspaceTabStyles({ selected })}
        >
          <span
            aria-hidden="true"
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-sm font-semibold text-white dark:bg-indigo-400 dark:text-zinc-950"
          >
            {workspace.initials}
          </span>
          <span
            className={clsx(
              "flex min-w-0 flex-col",
              !selected && "max-sm:sr-only",
            )}
          >
            <span className="truncate text-sm font-semibold">
              {workspace.name}
            </span>
            <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {PLAN_LABELS[workspace.plan]} · {REGION_LABELS[workspace.region]}{" "}
              · {ROLE_LABELS[role]}
            </span>
          </span>
        </button>
      );
    })}
  </div>
);
