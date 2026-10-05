import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { ChannelState } from "examples/shared/courier/types/ChannelState";

export const getChannelState = (
  channel: ChannelId,
  channels: ChannelId[],
  filter: ChannelId | undefined,
): ChannelState => {
  if (!channels.includes(channel)) {
    return "locked";
  }

  if (channel === filter) {
    return "selected";
  }

  return "available";
};
