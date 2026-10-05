<script lang="ts">
  import { prismStatusStore } from "@priemskiyyy/prism-svelte";
  import { formatStatus } from "examples/shared/courier/utils/formatStatus";
  import { dotStyles } from "examples/shared/ui/styles/dotStyles";
  import { getStatusTone } from "examples/shared/ui/utils/getStatusTone";
  import ToneBadge from "src/components/Badge/ToneBadge.svelte";

  const status = prismStatusStore();
  const tone = $derived(getStatusTone($status));
</script>

<ToneBadge {tone}>
  <span aria-hidden="true" class={dotStyles({ tone })}></span>
  {formatStatus($status)}
</ToneBadge>
