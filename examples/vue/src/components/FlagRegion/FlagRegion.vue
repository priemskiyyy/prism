<script setup lang="ts">
import type { RegisteredKey } from "@priemskiyyy/prism-vue";
import FlagChip from "src/components/FlagChip/FlagChip.vue";

defineProps<{ flagKeys: RegisteredKey[]; markers: boolean }>();
</script>

<template>
  <div class="relative min-w-0">
    <slot />
    <template v-if="markers">
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -inset-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700"
      />
      <div class="absolute -top-4 left-3 z-10 flex flex-wrap gap-1">
        <FlagChip
          v-for="flagKey in flagKeys"
          :key="flagKey"
          :flag-key="flagKey"
        />
      </div>
    </template>
  </div>
</template>
