<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";
  import type { Inbox } from "examples/shared/courier/types/Inbox";
  import ConversationList from "src/components/Courier/ConversationList.svelte";
  import ConversationView from "src/components/Courier/ConversationView.svelte";
  import FlagChip from "src/components/FlagChip/FlagChip.svelte";

  type Props = {
    inbox: Inbox;
    markers: boolean;
    onConversationSelect: (id: string) => void;
  };

  let { inbox, markers, onConversationSelect }: Props = $props();
  const split = flagStore("layout", (layout) => layout === "split");
</script>

<div
  class={[
    "grid min-w-0",
    $split &&
      "lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:divide-x lg:divide-zinc-200 dark:lg:divide-zinc-800",
  ]}
>
  <div
    class={[
      "flex min-w-0 flex-col border-b border-zinc-200 dark:border-zinc-800",
      $split && "lg:border-b-0",
    ]}
  >
    <div
      class="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800"
    >
      <span class="text-base font-semibold">Conversations</span>
      <span class="text-sm text-zinc-500 tabular-nums">
        {inbox.conversations.length}
      </span>
      {#if markers}
        <span class="ml-auto">
          <FlagChip flagKey="layout" />
        </span>
      {/if}
    </div>
    <ConversationList {inbox} {onConversationSelect} />
  </div>
  {#if inbox.selected !== undefined}
    {#key inbox.selected.id}
      <ConversationView conversation={inbox.selected} {markers} />
    {/key}
  {/if}
</div>
