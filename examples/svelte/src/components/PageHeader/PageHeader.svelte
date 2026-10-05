<script lang="ts">
  import { ICONS } from "examples/shared/ui/constants/icons";
  import StatusBadge from "src/components/Badge/StatusBadge.svelte";
  import ToneBadge from "src/components/Badge/ToneBadge.svelte";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";
</script>

<header
  class="sticky top-0 z-20 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70"
>
  <div
    class="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6"
  >
    <span
      class="flex size-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300"
    >
      <BaseIcon src={ICONS.tray} size="regular" />
    </span>
    <h1 class="text-lg font-semibold">Courier</h1>
    <StatusBadge />
    <ToneBadge tone="neutral">Svelte</ToneBadge>
  </div>
</header>
