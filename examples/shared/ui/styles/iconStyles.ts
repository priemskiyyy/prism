import { cva } from "class-variance-authority";
import type { IconSize } from "examples/shared/ui/types/IconSize";

export const iconStyles = cva(
  "inline-block shrink-0 bg-current mask-contain mask-center mask-no-repeat",
  {
    variants: {
      size: {
        small: "size-3.5",
        regular: "size-4",
        large: "size-[18px]",
      } satisfies Record<IconSize, string>,
    },
  },
);
