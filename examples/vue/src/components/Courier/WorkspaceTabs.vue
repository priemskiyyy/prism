<script setup lang="ts">
import { computed } from "vue";
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

const props = defineProps<{ membership: Membership }>();
const emit = defineEmits<{ select: [workspaceId: WorkspaceId] }>();
const memberships = computed(() => getMemberships(props.membership.userId));
</script>

<template>
  <div role="group" aria-label="Workspaces" class="flex min-w-0 gap-1.5">
    <button
      v-for="{ workspaceId, role } in memberships"
      :key="workspaceId"
      type="button"
      :aria-pressed="workspaceId === props.membership.workspaceId"
      :class="
        workspaceTabStyles({
          selected: workspaceId === props.membership.workspaceId,
        })
      "
      @click="emit('select', workspaceId)"
    >
      <span
        aria-hidden="true"
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500 text-sm font-semibold text-white dark:bg-indigo-400 dark:text-zinc-950"
      >
        {{ WORKSPACES[workspaceId].initials }}
      </span>
      <span
        class="flex min-w-0 flex-col"
        :class="{
          'max-sm:sr-only': workspaceId !== props.membership.workspaceId,
        }"
      >
        <span class="truncate text-sm font-semibold">
          {{ WORKSPACES[workspaceId].name }}
        </span>
        <span class="truncate text-xs text-zinc-500 dark:text-zinc-400">
          {{ PLAN_LABELS[WORKSPACES[workspaceId].plan] }} ·
          {{ REGION_LABELS[WORKSPACES[workspaceId].region] }} ·
          {{ ROLE_LABELS[role] }}
        </span>
      </span>
    </button>
  </div>
</template>
