<script setup lang="ts">
import { computed } from "vue";
import { useFlagDetails } from "@priemskiyyy/prism-vue";
import type { RegisteredKey } from "@priemskiyyy/prism-vue";
import { ICONS } from "examples/shared/ui/constants/icons";
import { RESOLUTION_TONES } from "examples/shared/ui/constants/tones";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { FLAG_CHIP_CLASS_NAME } from "examples/shared/ui/styles/flagChipStyles";
import BaseIcon from "src/components/BaseIcon/BaseIcon.vue";

const props = defineProps<{ flagKey: RegisteredKey }>();
const details = useFlagDetails(() => props.flagKey);

const revision = computed(
  () => `${details.value.resolution}:${JSON.stringify(details.value.value)}`,
);
</script>

<template>
  <span
    :key="revision"
    :title="`${props.flagKey} is ${details.resolution}`"
    :class="FLAG_CHIP_CLASS_NAME"
  >
    <BaseIcon :src="ICONS.flag" size="small" />
    {{ props.flagKey }}
    <span
      aria-hidden="true"
      :class="dotStyles({ tone: RESOLUTION_TONES[details.resolution] })"
    />
  </span>
</template>
