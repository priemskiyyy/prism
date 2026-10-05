<script setup lang="ts">
import { iconStyles } from "examples/shared/ui/styles/iconStyles";
import type { IconSize } from "examples/shared/ui/types/IconSize";
import { getIconMask } from "examples/shared/ui/utils/getIconMask";

defineProps<{ src: string; size: IconSize }>();
</script>

<template>
  <span
    aria-hidden="true"
    :class="iconStyles({ size })"
    :style="{ maskImage: getIconMask(src) }"
  />
</template>
