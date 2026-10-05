import type React from "react";
import { Code } from "@phosphor-icons/react";
import { PROVIDER_IDS } from "examples/shared/courier/constants/providerIds";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import { Badge } from "src/components/Badge/Badge";
import { Panel } from "src/components/Panel/Panel";
import { CopyButton } from "src/components/Providers/CopyButton";
import { ProviderCard } from "src/components/Providers/ProviderCard";
import { PROVIDER_GUIDES } from "src/utils/constants/providerGuides";

type ProvidersPanelProps = {
  selected: ProviderId;
  onProviderSelect: (id: ProviderId) => void;
};

export const ProvidersPanel: React.FunctionComponent<ProvidersPanelProps> = ({
  selected,
  onProviderSelect,
}) => {
  const guide = PROVIDER_GUIDES[selected];

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <ul aria-label="Providers" className="grid gap-2 sm:grid-cols-2">
        {PROVIDER_IDS.map((id) => (
          <li key={id}>
            <ProviderCard
              id={id}
              selected={id === selected}
              onProviderSelect={onProviderSelect}
            />
          </li>
        ))}
      </ul>
      <Panel
        title={`${guide.name} setup`}
        icon={Code}
        shows={guide.changes}
        aside={
          <>
            <Badge tone={guide.network ? "accent" : "neutral"}>
              {guide.network ? "Uses the lab network" : "Evaluates in the page"}
            </Badge>
            <CopyButton text={guide.snippet} />
          </>
        }
      >
        <pre className="overflow-x-auto rounded-lg bg-zinc-950 p-4 font-mono text-sm leading-relaxed text-zinc-100">
          <code>{guide.snippet}</code>
        </pre>
      </Panel>
    </div>
  );
};
