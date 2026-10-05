import { cva } from "class-variance-authority";

export const channelNavStyles = cva(
  "flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-left text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-indigo-500",
  {
    variants: {
      state: {
        selected:
          "bg-white text-indigo-700 shadow-sm ring-1 ring-indigo-200 dark:bg-zinc-800 dark:text-indigo-200 dark:ring-indigo-800",
        available:
          "text-zinc-700 hover:bg-white/80 dark:text-zinc-300 dark:hover:bg-zinc-800/60",
        locked: "cursor-not-allowed text-zinc-400 dark:text-zinc-600",
      },
    },
  },
);
