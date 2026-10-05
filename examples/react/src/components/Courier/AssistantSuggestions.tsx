import type React from "react";
import { Sparkle } from "@phosphor-icons/react";
import { useFlag } from "@priemskiyyy/prism-react";
import { ASSISTANT_SUGGESTIONS } from "examples/shared/courier/constants/assistantSuggestions";

type AssistantSuggestionsProps = {
  onSuggestionPick: (suggestion: string) => void;
};

export const AssistantSuggestions: React.FunctionComponent<
  AssistantSuggestionsProps
> = ({ onSuggestionPick }) => {
  const enabled = useFlag("assistant");

  if (!enabled) {
    return (
      <p className="flex items-center gap-2 px-1 py-1 text-sm text-zinc-500 dark:text-zinc-400">
        <Sparkle aria-hidden="true" size={16} />
        AI replies are not part of this workspace's plan.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-1 py-1">
      <p className="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
        <Sparkle aria-hidden="true" size={16} weight="fill" />
        Suggested replies
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ASSISTANT_SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => onSuggestionPick(suggestion)}
            className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-left text-sm text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
