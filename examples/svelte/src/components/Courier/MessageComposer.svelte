<script lang="ts">
  import { flagStore } from "@priemskiyyy/prism-svelte";
  import { COMPOSER_TOOLS } from "examples/shared/ui/constants/composerTools";
  import { ICONS } from "examples/shared/ui/constants/icons";
  import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
  import { FIELD_CLASS_NAME } from "examples/shared/ui/styles/fieldStyles";
  import BaseIcon from "src/components/BaseIcon/BaseIcon.svelte";

  type Props = { draft: string };

  let { draft = $bindable() }: Props = $props();
  const modern = flagStore("composer");
  const uploads = flagStore("uploads");

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    draft = "";
  };
</script>

<form
  aria-label="Reply"
  class={[
    "flex flex-col gap-2.5 rounded-xl border p-3",
    $modern
      ? "border-indigo-300 ring-2 ring-indigo-500/15 dark:border-indigo-800"
      : "border-zinc-200 dark:border-zinc-800",
  ]}
  onsubmit={handleSubmit}
>
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
      {$modern ? "New composer" : "Classic composer"}
    </span>
    {#if $modern}
      <div role="toolbar" aria-label="Formatting" class="ml-auto flex gap-0.5">
        {#each COMPOSER_TOOLS as tool (tool.label)}
          <button
            type="button"
            aria-label={tool.label}
            class={buttonStyles({ variant: "ghost", size: "small" })}
          >
            <BaseIcon src={tool.icon} size="regular" />
          </button>
        {/each}
      </div>
    {/if}
  </div>
  <textarea
    bind:value={draft}
    aria-label="Message"
    rows={$modern ? 3 : 2}
    placeholder={$modern
      ? "Write a reply, type / for templates"
      : "Write a reply"}
    class={FIELD_CLASS_NAME}></textarea>
  <div
    class="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
  >
    <BaseIcon src={ICONS.paperclip} size="regular" />
    <span>
      Up to {$uploads.maxFiles}
      {$uploads.maxFiles === 1 ? "file" : "files"}, {$uploads.maxMegabytes} MB each
    </span>
    <button
      type="submit"
      disabled={draft.trim() === ""}
      class={[buttonStyles({ variant: "primary", size: "small" }), "ml-auto"]}
    >
      <BaseIcon src={ICONS.paperPlaneRight} size="small" />
      Send
    </button>
  </div>
</form>
