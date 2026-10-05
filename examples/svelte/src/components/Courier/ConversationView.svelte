<script lang="ts">
  import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
  import type { Conversation } from "examples/shared/courier/types/Conversation";
  import ToneBadge from "src/components/Badge/ToneBadge.svelte";
  import AssistantSuggestions from "src/components/Courier/AssistantSuggestions.svelte";
  import MessageComposer from "src/components/Courier/MessageComposer.svelte";
  import FlagRegion from "src/components/FlagRegion/FlagRegion.svelte";

  type Props = {
    conversation: Conversation;
    markers: boolean;
  };

  let { conversation, markers }: Props = $props();
  let draft = $state("");
</script>

<div
  aria-label={`Conversation with ${conversation.contact}`}
  class="flex min-w-0 flex-col gap-5 p-4 sm:p-5"
>
  <header class="flex flex-wrap items-center gap-2">
    <h4 class="text-base font-semibold">{conversation.contact}</h4>
    <ToneBadge tone="neutral">{CHANNEL_LABELS[conversation.channel]}</ToneBadge>
  </header>
  <ol aria-label="Messages" class="flex flex-col gap-2">
    {#each conversation.messages as message (message.text)}
      <li
        class={[
          "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
          message.from === "agent"
            ? "self-end bg-indigo-500 text-white dark:bg-indigo-400 dark:text-zinc-950"
            : "self-start bg-zinc-100 dark:bg-zinc-800",
        ]}
      >
        {message.text}
      </li>
    {/each}
  </ol>
  <FlagRegion flagKeys={["assistant"]} {markers}>
    <AssistantSuggestions
      onSuggestionPick={(suggestion) => (draft = suggestion)}
    />
  </FlagRegion>
  <FlagRegion flagKeys={["composer", "uploads"]} {markers}>
    <MessageComposer bind:draft />
  </FlagRegion>
</div>
