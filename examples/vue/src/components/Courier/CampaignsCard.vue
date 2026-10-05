<script setup lang="ts">
import { useFlag } from "@priemskiyyy/prism-vue";
import { formatCount } from "examples/shared/courier/utils/formatCount";
import { ICONS } from "examples/shared/ui/constants/icons";
import BaseIcon from "src/components/BaseIcon/BaseIcon.vue";

const campaigns = useFlag("campaigns");
</script>

<template>
  <section
    aria-label="Broadcasts"
    class="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
  >
    <p class="flex items-center gap-2 text-sm font-medium">
      <BaseIcon :src="ICONS.megaphone" size="regular" />
      Broadcasts
    </p>
    <p v-if="campaigns.enabled" class="flex items-baseline gap-1.5">
      <span class="text-xl font-semibold tabular-nums">
        {{ formatCount(campaigns.dailyRecipients) }}
      </span>
      <span class="text-xs text-zinc-500">recipients a day</span>
    </p>
    <p
      v-else
      class="flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400"
    >
      <BaseIcon :src="ICONS.lock" size="small" />
      Admins on Business and Enterprise send broadcasts.
    </p>
  </section>
</template>
