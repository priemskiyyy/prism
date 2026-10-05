<script lang="ts">
  import type { RegisteredKey } from "@priemskiyyy/prism-svelte";
  import type { Snippet } from "svelte";
  import FlagChip from "src/components/FlagChip/FlagChip.svelte";

  type Props = {
    flagKeys: RegisteredKey[];
    markers: boolean;
    children: Snippet;
  };

  let { flagKeys, markers, children }: Props = $props();
</script>

<div class="relative min-w-0">
  {@render children()}
  {#if markers}
    <div
      aria-hidden="true"
      class="pointer-events-none absolute -inset-1.5 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-700"
    ></div>
    <div class="absolute -top-4 left-3 z-10 flex flex-wrap gap-1">
      {#each flagKeys as flagKey (flagKey)}
        <FlagChip {flagKey} />
      {/each}
    </div>
  {/if}
</div>
