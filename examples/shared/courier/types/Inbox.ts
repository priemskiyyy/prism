import type { ChannelId } from "examples/shared/courier/types/ChannelId";
import type { Conversation } from "examples/shared/courier/types/Conversation";

export type Inbox = {
  available: Conversation[];
  filter: ChannelId | undefined;
  conversations: Conversation[];
  selected: Conversation | undefined;
};
