import { cva } from "class-variance-authority";

export const switchTrackStyles = cva(
  "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition",
  {
    variants: {
      checked: {
        true: "bg-indigo-500",
        false: "bg-zinc-300 dark:bg-zinc-700",
      },
    },
  },
);

export const switchThumbStyles = cva(
  "inline-block size-4 rounded-full bg-white shadow transition",
  {
    variants: {
      checked: {
        true: "translate-x-[1.125rem]",
        false: "translate-x-0.5",
      },
    },
  },
);
