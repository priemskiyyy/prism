import type React from "react";
import type { Icon } from "@phosphor-icons/react";
import { iconTileStyles } from "src/styles/iconTileStyles";

type IconTileProps = { icon: Icon; size: "regular" | "small" };

export const IconTile: React.FunctionComponent<IconTileProps> = ({
  icon: TileIcon,
  size,
}) => (
  <span aria-hidden="true" className={iconTileStyles({ size })}>
    <TileIcon size={size === "small" ? 16 : 20} weight="duotone" />
  </span>
);
