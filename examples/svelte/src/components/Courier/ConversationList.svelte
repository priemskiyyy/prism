<script lang="ts">
  import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
  import type { Inbox } from "examples/shared/courier/types/Inbox";
  import { CHANNEL_ICONS } from "examples/shared/ui/constants/icons";
  import { conversationStyles } from "examples/shared/ui/styles/conversationStyles";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";
  import EmptyState from "src/components/EmptyState/EmptyState.svelte";

  type Props = { inbox: Inbox; onConversationSelect: (id: string) => void };

  let { inbox, onConversationSelect }: Props = $props();
</script>

{#if inbox.conversations.length === 0}
  <EmptyState
    title="No conversations here"
    description="This channel has no conversations in the current workspace."
  />
{:else}
  <ul
    aria-label="Conversations"
    class="flex flex-col divide-y divide-zinc-200/70 dark:divide-zinc-800"
  >
    {#each inbox.conversations as conversation (conversation.id)}
      {@const selected = conversation.id === inbox.selected?.id}
      <li>
        <button
          type="button"
          aria-pressed={selected}
          class={conversationStyles({ selected })}
          onclick={() => onConversationSelect(conversation.id)}
        >
          <span
            aria-hidden="true"
            class="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <BaseIcon src={CHANNEL_ICONS[conversation.channel]} size="large" />
          </span>
          <span class="flex min-w-0 flex-1 flex-col">
            <span class="flex items-baseline gap-2">
              <span class="truncate text-[15px] font-medium">
                {conversation.contact}
              </span>
              <span class="ml-auto shrink-0 text-xs text-zinc-500">
                {conversation.time}
              </span>
            </span>
            <span class="truncate text-sm text-zinc-600 dark:text-zinc-400">
              {conversation.preview}
            </span>
            <span class="sr-only">{CHANNEL_LABELS[conversation.channel]}</span>
          </span>
          {#if conversation.unread > 0}
            <span
              class="mt-1 rounded-full bg-indigo-500 px-2 text-xs font-semibold text-white tabular-nums"
            >
              {conversation.unread}
            </span>
          {/if}
        </button>
      </li>
    {/each}
  </ul>
{/if}
