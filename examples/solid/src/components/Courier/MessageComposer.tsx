import { For, Show } from "solid-js";
import type { Component } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";
import { COMPOSER_TOOLS } from "examples/shared/ui/constants/composerTools";
import { ICONS } from "examples/shared/ui/constants/icons";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { FIELD_CLASS_NAME } from "examples/shared/ui/styles/fieldStyles";
import { BaseIcon } from "src/components/BaseIcon/BaseIcon";

type MessageComposerProps = {
  draft: string;
  onDraftChange: (draft: string) => void;
};

export const MessageComposer: Component<MessageComposerProps> = (props) => {
  const modern = useFlag("composer");
  const uploads = useFlag("uploads");

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    props.onDraftChange("");
  };

  return (
    <form
      aria-label="Reply"
      class="flex flex-col gap-2.5 rounded-xl border p-3"
      classList={{
        "border-indigo-300 ring-2 ring-indigo-500/15 dark:border-indigo-800":
          modern(),
        "border-zinc-200 dark:border-zinc-800": !modern(),
      }}
      onSubmit={handleSubmit}
    >
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {modern() ? "New composer" : "Classic composer"}
        </span>
        <Show when={modern()}>
          <div
            role="toolbar"
            aria-label="Formatting"
            class="ml-auto flex gap-0.5"
          >
            <For each={COMPOSER_TOOLS}>
              {(tool) => (
                <button
                  type="button"
                  aria-label={tool.label}
                  class={buttonStyles({ variant: "ghost", size: "small" })}
                >
                  <BaseIcon src={tool.icon} size="regular" />
                </button>
              )}
            </For>
          </div>
        </Show>
      </div>
      <textarea
        aria-label="Message"
        value={props.draft}
        rows={modern() ? 3 : 2}
        placeholder={
          modern() ? "Write a reply, type / for templates" : "Write a reply"
        }
        class={FIELD_CLASS_NAME}
        onInput={(event) => props.onDraftChange(event.currentTarget.value)}
      />
      <div class="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <BaseIcon src={ICONS.paperclip} size="regular" />
        <span>
          Up to {uploads().maxFiles}{" "}
          {uploads().maxFiles === 1 ? "file" : "files"},{" "}
          {uploads().maxMegabytes} MB each
        </span>
        <button
          type="submit"
          disabled={props.draft.trim() === ""}
          class={`${buttonStyles({ variant: "primary", size: "small" })} ml-auto`}
        >
          <BaseIcon src={ICONS.paperPlaneRight} size="small" />
          Send
        </button>
      </div>
    </form>
  );
};
