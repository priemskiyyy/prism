import { CONVERSATIONS } from "examples/shared/courier/constants/conversations";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import type { InboxSelection } from "examples/shared/courier/types/InboxSelection";

export const getInbox = ({
  workspaceId,
  channels,
  filter,
  selectedId,
}: InboxSelection): Inbox => {
  const available = CONVERSATIONS.filter(
    (conversation) =>
      conversation.workspaceId === workspaceId &&
      channels.includes(conversation.channel),
  );

  const activeFilter =
    filter !== undefined && channels.includes(filter) ? filter : undefined;

  const conversations = available.filter(
    (conversation) =>
      activeFilter === undefined || conversation.channel === activeFilter,
  );

  return {
    available,
    filter: activeFilter,
    conversations,
    selected:
      conversations.find((conversation) => conversation.id === selectedId) ??
      conversations[0],
  };
};
