<script lang="ts">
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

  type Props = {
    membership: Membership;
    onWorkspaceSelect: (workspaceId: WorkspaceId) => void;
  };

  let { membership, onWorkspaceSelect }: Props = $props();
</script>

<div role="group" aria-label="Workspaces" class="flex min-w-0 gap-1.5">
  {#each getMemberships(membership.userId) as { workspaceId, role } (workspaceId)}
    {@const workspace = WORKSPACES[workspaceId]}
    {@const selected = workspaceId === membership.workspaceId}
    <button
      type="button"
      aria-pressed={selected}
      class={workspaceTabStyles({ selected })}
      onclick={() => onWorkspaceSelect(workspaceId)}
    >
      <span
        aria-hidden="true"
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-sm font-semibold text-white dark:bg-indigo-400 dark:text-zinc-950"
      >
        {workspace.initials}
      </span>
      <span class={["flex min-w-0 flex-col", !selected && "max-sm:sr-only"]}>
        <span class="truncate text-sm font-semibold">{workspace.name}</span>
        <span class="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {PLAN_LABELS[workspace.plan]} · {REGION_LABELS[workspace.region]} ·
          {ROLE_LABELS[role]}
        </span>
      </span>
    </button>
  {/each}
</div>
