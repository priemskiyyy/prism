import type React from "react";
import {
  ArrowsClockwise,
  Broadcast,
  Bug,
  FileX,
  Flask,
  Warning,
  WifiSlash,
} from "@phosphor-icons/react";
import clsx from "clsx";
import type { FlagBackend } from "examples/shared/courier/types/FlagBackend";
import type { ProviderId } from "examples/shared/courier/types/ProviderId";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { CARD_CLASS_NAME } from "examples/shared/ui/styles/cardStyles";
import { LabControl } from "src/components/Lab/LabControl";
import { LabField } from "src/components/Lab/LabField";
import { SegmentedControl } from "src/components/SegmentedControl/SegmentedControl";
import { useBackendState } from "src/hooks/useBackendState";
import {
  ASSISTANT_ROLLOUT_OPTIONS,
  COMPOSER_ROLLOUT_OPTIONS,
  LATENCY_OPTIONS,
} from "src/utils/constants/labOptions";
import { PROVIDER_GUIDES } from "src/utils/constants/providerGuides";

type LabPanelProps = {
  backend: FlagBackend;
  provider: ProviderId;
  onRefreshPress: () => void;
};

export const LabPanel: React.FunctionComponent<LabPanelProps> = ({
  backend,
  provider,
  onRefreshPress,
}) => {
  const state = useBackendState(backend);
  const guide = PROVIDER_GUIDES[provider];

  return (
    <section
      aria-label="Lab"
      className={clsx(
        "flex h-full min-w-0 flex-col gap-5 border-dashed p-5",
        CARD_CLASS_NAME,
      )}
    >
      <h3 className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">
        <Flask
          aria-hidden="true"
          size={18}
          weight="duotone"
          className="text-indigo-600 dark:text-indigo-400"
        />
        Lab
      </h3>
      <div className="flex flex-col gap-3">
        <LabField label="Composer rollout">
          <SegmentedControl
            label="Composer rollout"
            options={COMPOSER_ROLLOUT_OPTIONS}
            value={state.rules.composerRollout}
            disabled={false}
            onSelect={backend.setComposerRollout}
          />
        </LabField>
        <LabField label="AI assistant">
          <SegmentedControl
            label="AI assistant"
            options={ASSISTANT_ROLLOUT_OPTIONS}
            value={state.rules.assistantRollout}
            disabled={false}
            onSelect={backend.setAssistantRollout}
          />
        </LabField>
        <LabField label="Network latency">
          <SegmentedControl
            label="Network latency"
            options={LATENCY_OPTIONS}
            value={state.latency}
            disabled={!guide.network}
            onSelect={backend.setLatency}
          />
        </LabField>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        <LabControl
          icon={Warning}
          label="Maintenance notice"
          description="Publishes a notice to EU workspaces. The flag holds an object or null."
          pressed={state.rules.maintenance}
          disabled={false}
          onPress={() => backend.setMaintenance(!state.rules.maintenance)}
        />
        <LabControl
          icon={FileX}
          label="Corrupt channels"
          description='Serves ["whatsapp", "fax"]. The schema rejects it, so the flag keeps its fallback.'
          pressed={state.rules.corruptChannels}
          disabled={false}
          onPress={() =>
            backend.setCorruptChannels(!state.rules.corruptChannels)
          }
        />
        <LabControl
          icon={Broadcast}
          label="Live updates"
          description="Pushes rule changes to the provider. Off, your API and memory see them on Refresh; the SDKs sync once it is back on."
          pressed={state.live}
          disabled={false}
          onPress={() => backend.setLive(!state.live)}
        />
        <LabControl
          icon={WifiSlash}
          label="Offline"
          description="Every request answers 503. The values stay and the status turns red."
          pressed={state.offline}
          disabled={!guide.network}
          onPress={() => backend.setOffline(!state.offline)}
        />
        <LabControl
          icon={Bug}
          label="Fail next request"
          description="The next request answers 503 once. The next read that succeeds recovers."
          pressed={state.failNext}
          disabled={!guide.network}
          onPress={backend.failNextRequest}
        />
      </ul>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRefreshPress}
          className={buttonStyles()}
        >
          <ArrowsClockwise aria-hidden="true" size={16} weight="bold" />
          Refresh now
        </button>
        {guide.network ? null : (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {guide.name} evaluates in the page, so the network controls are off.
          </p>
        )}
      </div>
    </section>
  );
};
