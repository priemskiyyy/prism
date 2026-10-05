import type React from "react";
import { ChatsTeardrop } from "@phosphor-icons/react";
import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import { conversationStyles } from "examples/shared/ui/styles/conversationStyles";
import { EmptyState } from "src/components/EmptyState/EmptyState";
import { CHANNEL_ICONS } from "src/utils/constants/channelIcons";

type ConversationListProps = {
  conversations: Conversation[];
  selectedId: string | undefined;
  onConversationSelect: (id: string) => void;
};

export const ConversationList: React.FunctionComponent<
  ConversationListProps
> = ({ conversations, selectedId, onConversationSelect }) => {
  if (conversations.length === 0) {
    return (
      <EmptyState
        icon={ChatsTeardrop}
        title="No conversations here"
        description="This channel has no conversations in the current workspace."
      />
    );
  }

  return (
    <ul
      aria-label="Conversations"
      className="flex flex-col divide-y divide-zinc-200/70 dark:divide-zinc-800"
    >
      {conversations.map((conversation) => {
        const ChannelIcon = CHANNEL_ICONS[conversation.channel];

        return (
          <li key={conversation.id}>
            <button
              type="button"
              aria-pressed={conversation.id === selectedId}
              onClick={() => onConversationSelect(conversation.id)}
              className={conversationStyles({
                selected: conversation.id === selectedId,
              })}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"
              >
                <ChannelIcon size={18} weight="duotone" />
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-baseline gap-2">
                  <span className="truncate text-[15px] font-medium">
                    {conversation.contact}
                  </span>
                  <span className="ml-auto shrink-0 text-xs text-zinc-500">
                    {conversation.time}
                  </span>
                </span>
                <span className="truncate text-sm text-zinc-600 dark:text-zinc-400">
                  {conversation.preview}
                </span>
                <span className="sr-only">
                  {CHANNEL_LABELS[conversation.channel]}
                </span>
              </span>
              {conversation.unread === 0 ? null : (
                <span className="mt-1 rounded-full bg-indigo-500 px-2 text-xs font-semibold text-white tabular-nums">
                  {conversation.unread}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
};
