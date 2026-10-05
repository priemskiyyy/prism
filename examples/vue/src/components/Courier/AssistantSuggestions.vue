<script setup lang="ts">
import { useFlag } from "@priemskiyyy/prism-vue";
import { ASSISTANT_SUGGESTIONS } from "examples/shared/courier/constants/assistantSuggestions";
import { ICONS } from "examples/shared/ui/constants/icons";
import BaseIcon from "src/components/BaseIcon/BaseIcon.vue";

const emit = defineEmits<{ pick: [suggestion: string] }>();
const enabled = useFlag("assistant");
</script>

<template>
  <div v-if="enabled" class="flex flex-col gap-2 px-1 py-1">
    <p
      class="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300"
    >
      <BaseIcon :src="ICONS.sparkle" size="regular" />
      Suggested replies
    </p>
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="suggestion in ASSISTANT_SUGGESTIONS"
        :key="suggestion"
        type="button"
        class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-left text-sm text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
        @click="emit('pick', suggestion)"
      >
        {{ suggestion }}
      </button>
    </div>
  </div>
  <p
    v-else
    class="flex items-center gap-2 px-1 py-1 text-sm text-zinc-500 dark:text-zinc-400"
  >
    <BaseIcon :src="ICONS.sparkle" size="regular" />
    AI replies are not part of this workspace's plan.
  </p>
</template>
