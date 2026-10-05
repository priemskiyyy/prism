import type React from "react";
import { Paperclip, PaperPlaneRight } from "@phosphor-icons/react";
import { useFlag } from "@priemskiyyy/prism-react";
import clsx from "clsx";
import type { FormEvent } from "react";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { FIELD_CLASS_NAME } from "examples/shared/ui/styles/fieldStyles";
import { COMPOSER_TOOLS } from "src/utils/constants/composerTools";

type ComposerProps = {
  draft: string;
  onDraftChange: (draft: string) => void;
};

export const Composer: React.FunctionComponent<ComposerProps> = ({
  draft,
  onDraftChange,
}) => {
  const modern = useFlag("composer");
  const uploads = useFlag("uploads");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onDraftChange("");
  };

  return (
    <form
      aria-label="Reply"
      onSubmit={handleSubmit}
      className={clsx(
        "flex flex-col gap-2.5 rounded-xl border p-3",
        modern
          ? "border-indigo-300 ring-2 ring-indigo-500/15 dark:border-indigo-800"
          : "border-zinc-200 dark:border-zinc-800",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          {modern ? "New composer" : "Classic composer"}
        </span>
        {modern ? (
          <div
            role="toolbar"
            aria-label="Formatting"
            className="ml-auto flex gap-0.5"
          >
            {COMPOSER_TOOLS.map(({ icon: ToolIcon, label }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                className={buttonStyles({ variant: "ghost", size: "small" })}
              >
                <ToolIcon size={16} weight="bold" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <textarea
        aria-label="Message"
        value={draft}
        onChange={(event) => onDraftChange(event.target.value)}
        rows={modern ? 3 : 2}
        placeholder={
          modern ? "Write a reply, type / for templates" : "Write a reply"
        }
        className={FIELD_CLASS_NAME}
      />
      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
        <Paperclip aria-hidden="true" size={16} />
        <span>
          Up to {uploads.maxFiles} {uploads.maxFiles === 1 ? "file" : "files"},{" "}
          {uploads.maxMegabytes} MB each
        </span>
        <button
          type="submit"
          disabled={draft.trim() === ""}
          className={clsx(
            buttonStyles({ variant: "primary", size: "small" }),
            "ml-auto",
          )}
        >
          <PaperPlaneRight aria-hidden="true" size={14} weight="bold" />
          Send
        </button>
      </div>
    </form>
  );
};
