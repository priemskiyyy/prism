<script setup lang="ts">
import type { CourierContext } from "examples/shared/courier/types/CourierContext";
import {
  switchThumbStyles,
  switchTrackStyles,
} from "examples/shared/ui/styles/switchStyles";

defineProps<{ context: CourierContext; markers: boolean }>();

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <footer
    class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-zinc-200 bg-zinc-50/80 px-4 py-2.5 text-xs dark:border-zinc-800 dark:bg-zinc-900/60"
  >
    <button
      type="button"
      role="switch"
      :aria-checked="markers"
      class="flex shrink-0 items-center gap-2 font-medium text-zinc-600 dark:text-zinc-300"
      @click="emit('toggle')"
    >
      <span :class="switchTrackStyles({ checked: markers })">
        <span :class="switchThumbStyles({ checked: markers })" />
      </span>
      Flag markers
    </button>
    <p
      class="flex w-full min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5 sm:w-auto sm:flex-1"
    >
      <span class="font-semibold text-zinc-600 dark:text-zinc-300">
        Context
      </span>
      <code
        class="min-w-0 font-mono break-all text-zinc-500 dark:text-zinc-400"
      >
        {{ JSON.stringify(context) }}
      </code>
    </p>
  </footer>
</template>
