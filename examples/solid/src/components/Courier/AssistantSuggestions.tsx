import { For, Show } from "solid-js";
import type { Component } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";
import { ASSISTANT_SUGGESTIONS } from "examples/shared/courier/constants/assistantSuggestions";
import { ICONS } from "examples/shared/ui/constants/icons";
import { BaseIcon } from "src/components/BaseIcon/BaseIcon";

type AssistantSuggestionsProps = {
  onSuggestionPick: (suggestion: string) => void;
};

export const AssistantSuggestions: Component<AssistantSuggestionsProps> = (
  props,
) => {
  const enabled = useFlag("assistant");

  return (
    <Show
      when={enabled()}
      fallback={
        <p class="flex items-center gap-2 px-1 py-1 text-sm text-zinc-500 dark:text-zinc-400">
          <BaseIcon src={ICONS.sparkle} size="regular" />
          AI replies are not part of this workspace's plan.
        </p>
      }
    >
      <div class="flex flex-col gap-2 px-1 py-1">
        <p class="flex items-center gap-2 text-sm font-medium text-indigo-700 dark:text-indigo-300">
          <BaseIcon src={ICONS.sparkle} size="regular" />
          Suggested replies
        </p>
        <div class="flex flex-wrap gap-1.5">
          <For each={ASSISTANT_SUGGESTIONS}>
            {(suggestion) => (
              <button
                type="button"
                class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-left text-sm text-indigo-800 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
                onClick={() => props.onSuggestionPick(suggestion)}
              >
                {suggestion}
              </button>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};
