<script lang="ts">
  import { iconStyles } from "examples/shared/ui/styles/iconStyles";
  import type { IconSize } from "examples/shared/ui/types/IconSize";
  import { getIconMask } from "examples/shared/ui/utils/getIconMask";

  type Props = { src: string; size: IconSize };

  let { src, size }: Props = $props();
</script>

<span
  aria-hidden="true"
  class={iconStyles({ size })}
  style:mask-image={getIconMask(src)}
></span>
