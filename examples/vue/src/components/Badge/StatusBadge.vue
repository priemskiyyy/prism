<script setup lang="ts">
import { computed } from "vue";
import { usePrismStatus } from "@priemskiyyy/prism-vue";
import { formatStatus } from "examples/shared/courier/utils/formatStatus";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
import ToneBadge from "src/components/Badge/ToneBadge.vue";

const status = usePrismStatus();
const tone = computed(() => getStatusTone(status.value));
</script>

<template>
  <ToneBadge :tone="tone">
    <span aria-hidden="true" :class="dotStyles({ tone })" />
    {{ formatStatus(status) }}
  </ToneBadge>
</template>
