import type React from "react";
import clsx from "clsx";
import { useState } from "react";
import { CHANNEL_LABELS } from "examples/shared/courier/constants/channels";
import type { Conversation } from "examples/shared/courier/types/Conversation";
import { Badge } from "src/components/Badge/Badge";
import { AssistantSuggestions } from "src/components/Courier/AssistantSuggestions";
import { Composer } from "src/components/Courier/Composer";
import { FlagRegion } from "src/components/FlagRegion/FlagRegion";

type ConversationViewProps = {
  conversation: Conversation;
  markers: boolean;
};

export const ConversationView: React.FunctionComponent<
  ConversationViewProps
> = ({ conversation, markers }) => {
  const [draft, setDraft] = useState("");

  return (
    <div
      aria-label={`Conversation with ${conversation.contact}`}
      className="flex min-w-0 flex-col gap-5 p-4 sm:p-5"
    >
      <header className="flex flex-wrap items-center gap-2">
        <h4 className="text-base font-semibold">{conversation.contact}</h4>
        <Badge tone="neutral">{CHANNEL_LABELS[conversation.channel]}</Badge>
      </header>
      <ol aria-label="Messages" className="flex flex-col gap-2">
        {conversation.messages.map((message) => (
          <li
            key={message.text}
            className={clsx(
              "max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed",
              message.from === "agent"
                ? "self-end bg-indigo-500 text-white dark:bg-indigo-400 dark:text-zinc-950"
                : "self-start bg-zinc-100 dark:bg-zinc-800",
            )}
          >
            {message.text}
          </li>
        ))}
      </ol>
      <FlagRegion flagKeys={["assistant"]} markers={markers}>
        <AssistantSuggestions onSuggestionPick={setDraft} />
      </FlagRegion>
      <FlagRegion flagKeys={["composer", "uploads"]} markers={markers}>
        <Composer draft={draft} onDraftChange={setDraft} />
      </FlagRegion>
    </div>
  );
};
