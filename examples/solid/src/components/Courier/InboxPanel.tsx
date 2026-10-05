import { Show } from "solid-js";
import type { Component } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";
import type { Inbox } from "examples/shared/courier/types/Inbox";
import { ConversationList } from "src/components/Courier/ConversationList";
import { ConversationView } from "src/components/Courier/ConversationView";
import { FlagChip } from "src/components/FlagChip/FlagChip";

type InboxPanelProps = {
  inbox: Inbox;
  markers: boolean;
  onConversationSelect: (id: string) => void;
};

export const InboxPanel: Component<InboxPanelProps> = (props) => {
  const layout = useFlag("layout");

  return (
    <div
      class="grid min-w-0"
      classList={{
        "lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:divide-x lg:divide-zinc-200 dark:lg:divide-zinc-800":
          layout() === "split",
      }}
    >
      <div
        class="flex min-w-0 flex-col border-b border-zinc-200 dark:border-zinc-800"
        classList={{ "lg:border-b-0": layout() === "split" }}
      >
        <div class="flex flex-wrap items-center gap-2 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <span class="text-base font-semibold">Conversations</span>
          <span class="text-sm text-zinc-500 tabular-nums">
            {props.inbox.conversations.length}
          </span>
          <Show when={props.markers}>
            <span class="ml-auto">
              <FlagChip flagKey="layout" />
            </span>
          </Show>
        </div>
        <ConversationList
          inbox={props.inbox}
          onConversationSelect={props.onConversationSelect}
        />
      </div>
      <Show when={props.inbox.selected} keyed>
        {(conversation) => (
          <ConversationView
            conversation={conversation}
            markers={props.markers}
          />
        )}
      </Show>
    </div>
  );
};
