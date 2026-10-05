<script setup lang="ts">
import {
  CHANNEL_IDS,
  CHANNEL_LABELS,
} from "examples/shared/courier/constants/channels";
import { getChannelState } from "examples/shared/courier/inbox/getChannelState";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import { CHANNEL_ICONS, ICONS } from "examples/shared/ui/constants/icons";
import { channelNavStyles } from "examples/shared/ui/styles/channelNavStyles";
import BaseIcon from "src/components/BaseIcon/BaseIcon.vue";

const props = defineProps<{ channels: ChannelId[]; inbox: Inbox }>();
const emit = defineEmits<{ select: [channel: ChannelId | undefined] }>();

const countOf = (channel: ChannelId) =>
  props.inbox.available.filter(
    (conversation) => conversation.channel === channel,
  ).length;

const stateOf = (channel: ChannelId) =>
  getChannelState(channel, props.channels, props.inbox.filter);
</script>

<template>
  <div
    role="group"
    aria-label="Channels"
    class="-m-1 flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-visible"
  >
    <button
      type="button"
      :aria-pressed="props.inbox.filter === undefined"
      :class="
        channelNavStyles({
          state: props.inbox.filter === undefined ? 'selected' : 'available',
        })
      "
      @click="emit('select', undefined)"
    >
      <BaseIcon :src="ICONS.tray" size="large" />
      All conversations
      <span class="ml-auto text-xs text-zinc-500 tabular-nums">
        {{ props.inbox.available.length }}
      </span>
    </button>
    <button
      v-for="channel in CHANNEL_IDS"
      :key="channel"
      type="button"
      :disabled="stateOf(channel) === 'locked'"
      :aria-pressed="stateOf(channel) === 'selected'"
      :title="
        stateOf(channel) === 'locked' ? 'Not included in this plan' : undefined
      "
      :class="channelNavStyles({ state: stateOf(channel) })"
      @click="emit('select', channel)"
    >
      <BaseIcon :src="CHANNEL_ICONS[channel]" size="large" />
      {{ CHANNEL_LABELS[channel] }}
      <span class="ml-auto text-xs text-zinc-500 tabular-nums">
        <template v-if="stateOf(channel) === 'locked'">
          <BaseIcon :src="ICONS.lock" size="small" />
          <span class="sr-only">Locked</span>
        </template>
        <template v-else>{{ countOf(channel) }}</template>
      </span>
    </button>
  </div>
</template>
