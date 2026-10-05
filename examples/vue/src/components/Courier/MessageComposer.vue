<script setup lang="ts">
import { useFlag } from "@priemskiyyy/prism-vue";
import { COMPOSER_TOOLS } from "examples/shared/ui/constants/composerTools";
import { ICONS } from "examples/shared/ui/constants/icons";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { FIELD_CLASS_NAME } from "examples/shared/ui/styles/fieldStyles";
import BaseIcon from "src/components/BaseIcon/BaseIcon.vue";

const draft = defineModel<string>("draft", { required: true });
const modern = useFlag("composer");
const uploads = useFlag("uploads");
</script>

<template>
  <form
    aria-label="Reply"
    class="flex flex-col gap-2.5 rounded-xl border p-3"
    :class="
      modern
        ? 'border-indigo-300 ring-2 ring-indigo-500/15 dark:border-indigo-800'
        : 'border-zinc-200 dark:border-zinc-800'
    "
    @submit.prevent="draft = ''"
  >
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {{ modern ? "New composer" : "Classic composer" }}
      </span>
      <div
        v-if="modern"
        role="toolbar"
        aria-label="Formatting"
        class="ml-auto flex gap-0.5"
      >
        <button
          v-for="tool in COMPOSER_TOOLS"
          :key="tool.label"
          type="button"
          :aria-label="tool.label"
          :class="buttonStyles({ variant: 'ghost', size: 'small' })"
        >
          <BaseIcon :src="tool.icon" size="regular" />
        </button>
      </div>
    </div>
    <textarea
      v-model="draft"
      aria-label="Message"
      :rows="modern ? 3 : 2"
      :placeholder="
        modern ? 'Write a reply, type / for templates' : 'Write a reply'
      "
      :class="FIELD_CLASS_NAME"
    />
    <div
      class="flex flex-wrap items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400"
    >
      <BaseIcon :src="ICONS.paperclip" size="regular" />
      <span>
        Up to {{ uploads.maxFiles }}
        {{ uploads.maxFiles === 1 ? "file" : "files" }},
        {{ uploads.maxMegabytes }} MB each
      </span>
      <button
        type="submit"
        :disabled="draft.trim() === ''"
        :class="[
          buttonStyles({ variant: 'primary', size: 'small' }),
          'ml-auto',
        ]"
      >
        <BaseIcon :src="ICONS.paperPlaneRight" size="small" />
        Send
      </button>
    </div>
  </form>
</template>
