import { cva } from "class-variance-authority";

export const workspaceTabStyles = cva(
  "flex min-w-0 shrink-0 items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
  {
    variants: {
      selected: {
        true: "shrink border-indigo-300 bg-indigo-50 shadow-sm dark:border-indigo-700 dark:bg-indigo-950/50",
        false:
          "border-transparent hover:border-zinc-200 hover:bg-zinc-50 dark:hover:border-zinc-800 dark:hover:bg-zinc-800/60",
      },
    },
  },
);
