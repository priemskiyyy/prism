import type { Option } from "src/types/Option";

export const BOOLEAN_OVERRIDES: Option<boolean>[] = [
  { value: true, label: "On" },
  { value: false, label: "Off" },
];

export const LAYOUT_OVERRIDES: Option<"classic" | "split">[] = [
  { value: "classic", label: "Classic" },
  { value: "split", label: "Split" },
];
