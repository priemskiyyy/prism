<script setup lang="ts">
import { useFlag } from "@priemskiyyy/prism-vue";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import ConversationList from "src/components/Courier/ConversationList.vue";
import ConversationView from "src/components/Courier/ConversationView.vue";
import FlagChip from "src/components/FlagChip/FlagChip.vue";

const props = defineProps<{
  inbox: Inbox;
  markers: boolean;
}>();

const emit = defineEmits<{ select: [id: string] }>();
const layout = useFlag("layout");
</script>

<template>
  <div
    class="grid min-w-0"
    :class="{
      'lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:divide-x lg:divide-zinc-200 dark:lg:divide-zinc-800':
        layout === 'split',
    }"
  >
    <div
      class="flex min-w-0 flex-col border-b border-zinc-200 dark:border-zinc-800"
      :class="{ 'lg:border-b-0': layout === 'split' }"
    >
      <div
        class="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800"
      >
        <span class="text-base font-semibold">Conversations</span>
        <span class="text-sm text-zinc-500 tabular-nums">
          {{ props.inbox.conversations.length }}
        </span>
        <span v-if="props.markers" class="ml-auto">
          <FlagChip flag-key="layout" />
        </span>
      </div>
      <ConversationList :inbox="props.inbox" @select="emit('select', $event)" />
    </div>
    <ConversationView
      v-if="props.inbox.selected"
      :key="props.inbox.selected.id"
      :conversation="props.inbox.selected"
      :markers="props.markers"
    />
  </div>
</template>
