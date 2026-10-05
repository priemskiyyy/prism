<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";
  import { ICONS } from "examples/shared/ui/constants/icons";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";
  import FlagRegion from "src/components/FlagRegion/FlagRegion.svelte";

  type Props = { markers: boolean };

  let { markers }: Props = $props();
  const maintenance = flagStore("maintenance");
</script>

{#if $maintenance !== null}
  <div class="px-4 pt-5">
    <FlagRegion flagKeys={["maintenance"]} {markers}>
      <div
        role="status"
        class="flex items-center gap-2.5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200"
      >
        <BaseIcon src={ICONS.warning} size="large" />
        {$maintenance.message}
      </div>
    </FlagRegion>
  </div>
{/if}
