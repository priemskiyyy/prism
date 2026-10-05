import type React from "react";
import { Tray } from "@phosphor-icons/react";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import { Badge } from "src/components/Badge/Badge";
import { StatusBadge } from "src/components/Badge/StatusBadge";
import { IconTile } from "src/components/IconTile/IconTile";
import { SectionNav } from "src/components/Section/SectionNav";
import { PROVIDER_GUIDES } from "src/utils/constants/providerGuides";

type HeaderProps = { provider: ProviderId };

export const Header: React.FunctionComponent<HeaderProps> = ({ provider }) => (
  <header className="sticky top-0 z-20 border-b border-zinc-200/70 bg-zinc-50/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 sm:px-6">
      <div className="mr-auto flex min-w-0 flex-wrap items-center gap-2">
        <IconTile icon={Tray} size="small" />
        <h1 className="text-lg font-semibold">Courier</h1>
        <StatusBadge />
        <Badge tone="neutral">{PROVIDER_GUIDES[provider].name}</Badge>
      </div>
      <div className="w-full min-w-0 sm:w-auto">
        <SectionNav />
      </div>
    </div>
  </header>
);
