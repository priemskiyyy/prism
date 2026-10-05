<script lang="ts">
  import { ICONS } from "examples/shared/ui/constants/icons";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";

  type Props = { title: string; description: string };

  let { title, description }: Props = $props();
</script>

<div
  class="m-4 flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-4 py-6 text-center dark:border-zinc-700"
>
  <span class="text-zinc-400">
    <BaseIcon src={ICONS.chatsTeardrop} size="large" />
  </span>
  <p class="text-base font-medium">{title}</p>
  <p class="max-w-sm text-sm text-zinc-500 dark:text-zinc-400">
    {description}
  </p>
</div>
