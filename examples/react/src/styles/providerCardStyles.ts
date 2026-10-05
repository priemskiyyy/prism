import { cva } from "class-variance-authority";

export const providerCardStyles = cva(
  "flex h-full w-full flex-col items-start gap-1.5 rounded-xl border p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500",
  {
    variants: {
      selected: {
        true: "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/40 dark:border-indigo-400 dark:bg-indigo-950/40",
        false:
          "border-zinc-200 bg-white hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700",
      },
    },
  },
);
