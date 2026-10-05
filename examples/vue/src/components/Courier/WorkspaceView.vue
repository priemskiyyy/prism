<script setup lang="ts">
import { computed, ref } from "vue";
import { useFlag } from "@priemskiyyy/prism-vue";
import { getInbox } from "examples/shared/courier/inbox/getInbox";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import CampaignsCard from "src/components/Courier/CampaignsCard.vue";
import ChannelNav from "src/components/Courier/ChannelNav.vue";
import ContactsCard from "src/components/Courier/ContactsCard.vue";
import InboxPanel from "src/components/Courier/InboxPanel.vue";
import FlagRegion from "src/components/FlagRegion/FlagRegion.vue";

const props = defineProps<{
  workspaceId: WorkspaceId;
  markers: boolean;
}>();

const channels = useFlag("channels");
const filter = ref<ChannelId | undefined>(undefined);
const selectedId = ref<string | undefined>(undefined);

const inbox = computed(() =>
  getInbox({
    workspaceId: props.workspaceId,
    channels: channels.value,
    filter: filter.value,
    selectedId: selectedId.value,
  }),
);
</script>

<template>
  <div
    class="grid min-w-0 md:grid-cols-[15rem_minmax(0,1fr)] md:grid-rows-[auto_1fr]"
  >
    <nav
      aria-label="Inbox"
      class="min-w-0 border-b border-zinc-200 bg-zinc-50/80 p-4 pt-6 md:border-r md:border-b-0 dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <FlagRegion :flag-keys="['channels']" :markers="props.markers">
        <ChannelNav
          :channels="channels"
          :inbox="inbox"
          @select="filter = $event"
        />
      </FlagRegion>
    </nav>
    <div class="min-w-0 md:col-start-2 md:row-span-2 md:row-start-1">
      <InboxPanel
        :inbox="inbox"
        :markers="props.markers"
        @select="selectedId = $event"
      />
    </div>
    <aside
      aria-label="Plan usage"
      class="grid min-w-0 content-end gap-6 border-t border-zinc-200 bg-zinc-50/80 p-4 pt-6 sm:grid-cols-2 md:grid-cols-1 md:border-t-0 md:border-r dark:border-zinc-800 dark:bg-zinc-900/50"
    >
      <FlagRegion :flag-keys="['contactLimit']" :markers="props.markers">
        <ContactsCard :workspace-id="props.workspaceId" />
      </FlagRegion>
      <FlagRegion :flag-keys="['campaigns']" :markers="props.markers">
        <CampaignsCard />
      </FlagRegion>
    </aside>
  </div>
</template>
