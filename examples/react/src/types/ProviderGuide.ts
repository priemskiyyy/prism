import type { Icon } from "@phosphor-icons/react";

export type ProviderGuide = {
  name: string;
  icon: Icon;
  summary: string;
  network: boolean;
  changes: string;
  snippet: string;
};
