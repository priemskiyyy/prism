import { For } from "solid-js";
import type { Component } from "solid-js";
import {
  CHANNEL_IDS,
  CHANNEL_LABELS,
} from "examples/shared/courier/constants/channels";
import { getChannelState } from "examples/shared/courier/inbox/getChannelState";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import { CHANNEL_ICONS, ICONS } from "examples/shared/ui/constants/icons";
import { channelNavStyles } from "examples/shared/ui/styles/channelNavStyles";
import { BaseIcon } from "src/components/BaseIcon/BaseIcon";

type ChannelNavProps = {
  channels: ChannelId[];
  inbox: Inbox;
  onFilterSelect: (channel: ChannelId | undefined) => void;
};

export const ChannelNav: Component<ChannelNavProps> = (props) => {
  const countOf = (channel: ChannelId) =>
    props.inbox.available.filter(
      (conversation) => conversation.channel === channel,
    ).length;

  return (
    <div
      role="group"
      aria-label="Channels"
      class="-m-1 flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-visible"
    >
      <button
        type="button"
        aria-pressed={props.inbox.filter === undefined}
        class={channelNavStyles({
          state: props.inbox.filter === undefined ? "selected" : "available",
        })}
        onClick={() => props.onFilterSelect(undefined)}
      >
        <BaseIcon src={ICONS.tray} size="large" />
        All conversations
        <span class="ml-auto text-xs text-zinc-500 tabular-nums">
          {props.inbox.available.length}
        </span>
      </button>
      <For each={CHANNEL_IDS}>
        {(channel) => {
          const state = () =>
            getChannelState(channel, props.channels, props.inbox.filter);

          return (
            <button
              type="button"
              disabled={state() === "locked"}
              aria-pressed={state() === "selected"}
              title={
                state() === "locked" ? "Not included in this plan" : undefined
              }
              class={channelNavStyles({ state: state() })}
              onClick={() => props.onFilterSelect(channel)}
            >
              <BaseIcon src={CHANNEL_ICONS[channel]} size="large" />
              {CHANNEL_LABELS[channel]}
              <span class="ml-auto text-xs text-zinc-500 tabular-nums">
                {state() === "locked" ? (
                  <>
                    <BaseIcon src={ICONS.lock} size="small" />
                    <span class="sr-only">Locked</span>
                  </>
                ) : (
                  countOf(channel)
                )}
              </span>
            </button>
          );
        }}
      </For>
    </div>
  );
};
