<script lang="ts">
  import {
    CHANNEL_IDS,
    CHANNEL_LABELS,
  } from "examples/shared/courier/constants/channels";
  import { getChannelState } from "examples/shared/courier/inbox/getChannelState";
  import type { ChannelId } from "examples/shared/courier/types/ChannelId";
  import type { Inbox } from "examples/shared/courier/types/Inbox";
  import { CHANNEL_ICONS, ICONS } from "examples/shared/ui/constants/icons";
  import { channelNavStyles } from "examples/shared/ui/styles/channelNavStyles";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";

  type Props = {
    channels: ChannelId[];
    inbox: Inbox;
    onFilterSelect: (channel: ChannelId | undefined) => void;
  };

  let { channels, inbox, onFilterSelect }: Props = $props();

  const countOf = (channel: ChannelId) =>
    inbox.available.filter((conversation) => conversation.channel === channel)
      .length;
</script>

<div
  role="group"
  aria-label="Channels"
  class="-m-1 flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-visible"
>
  <button
    type="button"
    aria-pressed={inbox.filter === undefined}
    class={channelNavStyles({
      state: inbox.filter === undefined ? "selected" : "available",
    })}
    onclick={() => onFilterSelect(undefined)}
  >
    <BaseIcon src={ICONS.tray} size="large" />
    All conversations
    <span class="ml-auto text-xs text-zinc-500 tabular-nums">
      {inbox.available.length}
    </span>
  </button>
  {#each CHANNEL_IDS as channel (channel)}
    {@const state = getChannelState(channel, channels, inbox.filter)}
    <button
      type="button"
      disabled={state === "locked"}
      aria-pressed={state === "selected"}
      title={state === "locked" ? "Not included in this plan" : undefined}
      class={channelNavStyles({ state })}
      onclick={() => onFilterSelect(channel)}
    >
      <BaseIcon src={CHANNEL_ICONS[channel]} size="large" />
      {CHANNEL_LABELS[channel]}
      <span class="ml-auto text-xs text-zinc-500 tabular-nums">
        {#if state === "locked"}
          <BaseIcon src={ICONS.lock} size="small" />
          <span class="sr-only">Locked</span>
        {:else}
          {countOf(channel)}
        {/if}
      </span>
    </button>
  {/each}
</div>
