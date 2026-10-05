<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";
  import { CONTACT_USAGE } from "examples/shared/courier/constants/contactUsage";
  import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
  import { formatCount } from "examples/shared/courier/utils/formatCount";
  import { ICONS } from "examples/shared/ui/constants/icons";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";

  type Props = { workspaceId: WorkspaceId };

  let { workspaceId }: Props = $props();
  const limit = flagStore("contactLimit");
  const used = $derived(CONTACT_USAGE[workspaceId]);
  const ratio = $derived(Math.min(used / $limit, 1));
</script>

<section
  aria-label="Contacts"
  class="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
>
  <p class="flex items-center gap-2 text-sm font-medium">
    <BaseIcon src={ICONS.addressBook} size="regular" />
    Contacts
  </p>
  <p class="flex items-baseline gap-1.5">
    <span class="text-xl font-semibold tabular-nums">{formatCount(used)}</span>
    <span class="text-xs text-zinc-500">of {formatCount($limit)}</span>
  </p>
  <div
    role="meter"
    aria-label="Contact usage"
    aria-valuemin={0}
    aria-valuemax={$limit}
    aria-valuenow={Math.min(used, $limit)}
    class="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
  >
    <div
      class={[
        "h-full rounded-full transition-all",
        ratio >= 1 ? "bg-rose-500" : "bg-indigo-500",
      ]}
      style:width={`${ratio * 100}%`}
    ></div>
  </div>
  {#if ratio >= 1}
    <p class="text-xs text-rose-600 dark:text-rose-400">
      Over the limit, new contacts are paused.
    </p>
  {/if}
</section>
