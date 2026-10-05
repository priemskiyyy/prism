import type React from "react";
import { CheckCircle } from "@phosphor-icons/react";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import { IconTile } from "src/components/IconTile/IconTile";
import { providerCardStyles } from "src/styles/providerCardStyles";
import { PROVIDER_GUIDES } from "src/utils/constants/providerGuides";

type ProviderCardProps = {
  id: ProviderId;
  selected: boolean;
  onProviderSelect: (id: ProviderId) => void;
};

export const ProviderCard: React.FunctionComponent<ProviderCardProps> = ({
  id,
  selected,
  onProviderSelect,
}) => {
  const guide = PROVIDER_GUIDES[id];

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={() => onProviderSelect(id)}
      className={providerCardStyles({ selected })}
    >
      <span className="flex w-full items-center gap-2">
        <IconTile icon={guide.icon} size="small" />
        <span className="text-base font-semibold">{guide.name}</span>
        {selected ? (
          <CheckCircle
            aria-hidden="true"
            size={18}
            weight="fill"
            className="ml-auto text-indigo-500"
          />
        ) : null}
      </span>
      <span className="text-sm text-zinc-600 dark:text-zinc-400">
        {guide.summary}
      </span>
    </button>
  );
};
