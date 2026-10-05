import { cva } from "class-variance-authority";

export const conversationStyles = cva(
  "flex w-full min-w-0 items-start gap-3 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-indigo-500",
  {
    variants: {
      selected: {
        true: "bg-indigo-50 dark:bg-indigo-950/40",
        false: "hover:bg-zinc-50 dark:hover:bg-zinc-800/50",
      },
    },
  },
);
