import { cva } from "class-variance-authority";

export const iconTileStyles = cva(
  "inline-flex shrink-0 items-center justify-center bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300",
  {
    variants: {
      size: {
        regular: "size-9 rounded-xl",
        small: "size-8 rounded-lg",
      },
    },
    defaultVariants: { size: "regular" },
  },
);
