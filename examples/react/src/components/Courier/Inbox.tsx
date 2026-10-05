import type React from "react";
import { useFlag } from "@priemskiyyy/prism-react";
import clsx from "clsx";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import { ConversationList } from "src/components/Courier/ConversationList";
import { ConversationView } from "src/components/Courier/ConversationView";
import { FlagChip } from "src/components/FlagChip/FlagChip";

type InboxProps = {
  conversations: Conversation[];
  selected: Conversation | undefined;
  markers: boolean;
  onConversationSelect: (id: string) => void;
};

export const Inbox: React.FunctionComponent<InboxProps> = ({
  conversations,
  selected,
  markers,
  onConversationSelect,
}) => {
  const split = useFlag("layout", (layout) => layout === "split");

  return (
    <div
      className={clsx(
        "grid min-w-0",
        split &&
          "lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:divide-x lg:divide-zinc-200 dark:lg:divide-zinc-800",
      )}
    >
      <div
        className={clsx(
          "flex min-w-0 flex-col border-b border-zinc-200 dark:border-zinc-800",
          split && "lg:border-b-0",
        )}
      >
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span className="text-base font-semibold">Conversations</span>
          <span className="text-sm text-zinc-500 tabular-nums">
            {conversations.length}
          </span>
          {markers ? (
            <span className="ml-auto">
              <FlagChip flagKey="layout" />
            </span>
          ) : null}
        </div>
        <ConversationList
          conversations={conversations}
          selectedId={selected?.id}
          onConversationSelect={onConversationSelect}
        />
      </div>
      {selected === undefined ? null : (
        <ConversationView
          key={selected.id}
          conversation={selected}
          markers={markers}
        />
      )}
    </div>
  );
};
