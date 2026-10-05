import type React from "react";
import { Lock, Tray } from "@phosphor-icons/react";
import {
  CHANNEL_IDS,
  CHANNEL_LABELS,
} from "examples/shared/courier/constants/channels";
import { getChannelState } from "examples/shared/courier/inbox/getChannelState";
import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import { channelNavStyles } from "examples/shared/ui/styles/channelNavStyles";
import { CHANNEL_ICONS } from "src/utils/constants/channelIcons";

type ChannelNavProps = {
  channels: ChannelId[];
  conversations: Conversation[];
  filter: ChannelId | undefined;
  onFilterSelect: (channel: ChannelId | undefined) => void;
};

export const ChannelNav: React.FunctionComponent<ChannelNavProps> = ({
  channels,
  conversations,
  filter,
  onFilterSelect,
}) => {
  const countOf = (channel: ChannelId) =>
    conversations.filter((conversation) => conversation.channel === channel)
      .length;

  return (
    <div
      role="group"
      aria-label="Channels"
      className="-m-1 flex gap-1 overflow-x-auto p-1 md:flex-col md:overflow-visible"
    >
      <button
        type="button"
        aria-pressed={filter === undefined}
        onClick={() => onFilterSelect(undefined)}
        className={channelNavStyles({
          state: filter === undefined ? "selected" : "available",
        })}
      >
        <Tray aria-hidden="true" size={18} weight="duotone" />
        All conversations
        <span className="ml-auto text-xs text-zinc-500 tabular-nums">
          {conversations.length}
        </span>
      </button>
      {CHANNEL_IDS.map((channel) => {
        const ChannelIcon = CHANNEL_ICONS[channel];
        const state = getChannelState(channel, channels, filter);

        return (
          <button
            key={channel}
            type="button"
            disabled={state === "locked"}
            aria-pressed={state === "selected"}
            title={state === "locked" ? "Not included in this plan" : undefined}
            onClick={() => onFilterSelect(channel)}
            className={channelNavStyles({ state })}
          >
            <ChannelIcon aria-hidden="true" size={18} weight="duotone" />
            {CHANNEL_LABELS[channel]}
            <span className="ml-auto text-xs text-zinc-500 tabular-nums">
              {state === "locked" ? (
                <Lock aria-label="Locked" size={14} weight="bold" />
              ) : (
                countOf(channel)
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
};
