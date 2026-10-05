import { createSignal, For } from "solid-js";
import type { Component } from "solid-js";
import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import { ToneBadge } from "src/components/Badge/ToneBadge";
import { AssistantSuggestions } from "src/components/Courier/AssistantSuggestions";
import { MessageComposer } from "src/components/Courier/MessageComposer";
import { FlagRegion } from "src/components/FlagRegion/FlagRegion";

type ConversationViewProps = {
  conversation: Conversation;
  markers: boolean;
};

export const ConversationView: Component<ConversationViewProps> = (props) => {
  const [draft, setDraft] = createSignal("");

  return (
    <div
      aria-label={`Conversation with ${props.conversation.contact}`}
      class="flex min-w-0 flex-col gap-5 p-4 sm:p-5"
    >
      <header class="flex flex-wrap items-center gap-2">
        <h4 class="text-base font-semibold">{props.conversation.contact}</h4>
        <ToneBadge tone="neutral">
          {CHANNEL_LABELS[props.conversation.channel]}
        </ToneBadge>
      </header>
      <ol aria-label="Messages" class="flex flex-col gap-2">
        <For each={props.conversation.messages}>
          {(message) => (
            <li
              class="max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed"
              classList={{
                "self-end bg-indigo-500 text-white dark:bg-indigo-400 dark:text-zinc-950":
                  message.from === "agent",
                "self-start bg-zinc-100 dark:bg-zinc-800":
                  message.from === "contact",
              }}
            >
              {message.text}
            </li>
          )}
        </For>
      </ol>
      <FlagRegion flagKeys={["assistant"]} markers={props.markers}>
        <AssistantSuggestions onSuggestionPick={setDraft} />
      </FlagRegion>
      <FlagRegion flagKeys={["composer", "uploads"]} markers={props.markers}>
        <MessageComposer draft={draft()} onDraftChange={setDraft} />
      </FlagRegion>
    </div>
  );
};
