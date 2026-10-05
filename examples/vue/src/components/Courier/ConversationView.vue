<script setup lang="ts">
import { ref } from "vue";
import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import ToneBadge from "src/components/Badge/ToneBadge.vue";
import AssistantSuggestions from "src/components/Courier/AssistantSuggestions.vue";
import MessageComposer from "src/components/Courier/MessageComposer.vue";
import FlagRegion from "src/components/FlagRegion/FlagRegion.vue";

const props = defineProps<{
  conversation: Conversation;
  markers: boolean;
}>();

const draft = ref("");
</script>

<template>
  <div
    :aria-label="`Conversation with ${props.conversation.contact}`"
    class="flex min-w-0 flex-col gap-5 p-4 sm:p-5"
  >
    <header class="flex flex-wrap items-center gap-2">
      <h4 class="text-base font-semibold">{{ props.conversation.contact }}</h4>
      <ToneBadge tone="neutral">
        {{ CHANNEL_LABELS[props.conversation.channel] }}
      </ToneBadge>
    </header>
    <ol aria-label="Messages" class="flex flex-col gap-2">
      <li
        v-for="message in props.conversation.messages"
        :key="message.text"
        class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed"
        :class="
          message.from === 'agent'
            ? 'self-end bg-indigo-500 text-white dark:bg-indigo-400 dark:text-zinc-950'
            : 'self-start bg-zinc-100 dark:bg-zinc-800'
        "
      >
        {{ message.text }}
      </li>
    </ol>
    <FlagRegion :flag-keys="['assistant']" :markers="props.markers">
      <AssistantSuggestions @pick="draft = $event" />
    </FlagRegion>
    <FlagRegion :flag-keys="['composer', 'uploads']" :markers="props.markers">
      <MessageComposer v-model:draft="draft" />
    </FlagRegion>
  </div>
</template>
