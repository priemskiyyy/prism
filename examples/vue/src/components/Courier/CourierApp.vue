<script setup lang="ts">
import { ref } from "vue";
import { getCourierContext } from "examples/shared/courier/directory/getCourierContext";
import type { Membership } from "examples/shared/courier/types/Membership";
import type { UserId } from "examples/shared/courier/types/UserId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { CARD_CLASS_NAME } from "examples/shared/ui/styles/cardStyles";
import MaintenanceBanner from "src/components/Courier/MaintenanceBanner.vue";
import StatusBar from "src/components/Courier/StatusBar.vue";
import UserSwitcher from "src/components/Courier/UserSwitcher.vue";
import WorkspaceTabs from "src/components/Courier/WorkspaceTabs.vue";
import WorkspaceView from "src/components/Courier/WorkspaceView.vue";

defineProps<{ membership: Membership }>();

const emit = defineEmits<{
  workspaceSelect: [workspaceId: WorkspaceId];
  userSelect: [userId: UserId];
}>();

const markers = ref(true);
</script>

<template>
  <section
    aria-label="Courier"
    class="min-w-0 overflow-hidden"
    :class="CARD_CLASS_NAME"
  >
    <header
      class="flex flex-wrap items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800"
    >
      <WorkspaceTabs
        :membership="membership"
        @select="emit('workspaceSelect', $event)"
      />
      <div class="ml-auto">
        <UserSwitcher
          :user-id="membership.userId"
          @select="emit('userSelect', $event)"
        />
      </div>
    </header>
    <MaintenanceBanner :markers="markers" />
    <WorkspaceView
      :key="membership.workspaceId"
      :workspace-id="membership.workspaceId"
      :markers="markers"
    />
    <StatusBar
      :context="getCourierContext(membership)"
      :markers="markers"
      @toggle="markers = !markers"
    />
  </section>
</template>
