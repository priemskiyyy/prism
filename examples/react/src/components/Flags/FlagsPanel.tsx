import type React from "react";
import { Flag } from "@phosphor-icons/react";
import { usePrism } from "@priemskiyyy/prism-react";
import { courierFlags } from "examples/shared/courier/flags";
import { ChoiceOverride } from "src/components/Flags/ChoiceOverride";
import { FlagRow } from "src/components/Flags/FlagRow";
import { JsonOverride } from "src/components/Flags/JsonOverride";
import { Panel } from "src/components/Panel/Panel";
import {
  BOOLEAN_OVERRIDES,
  LAYOUT_OVERRIDES,
} from "src/utils/constants/overrides";

export const FlagsPanel: React.FunctionComponent = () => {
  const flags = usePrism();

  return (
    <Panel
      title="Flag inspector"
      icon={Flag}
      shows="What every handle holds right now. Overrides stay in this page and pass the flag's own schema first."
      aside={null}
    >
      <ul
        aria-label="Flags"
        className="flex flex-col divide-y divide-zinc-200/70 dark:divide-zinc-800"
      >
        <FlagRow handle={flags.flag("channels")}>
          <JsonOverride
            handle={flags.flag("channels")}
            definition={courierFlags.channels}
            example='["whatsapp", "sms"]'
          />
        </FlagRow>
        <FlagRow handle={flags.flag("assistant")}>
          <ChoiceOverride
            handle={flags.flag("assistant")}
            options={BOOLEAN_OVERRIDES}
          />
        </FlagRow>
        <FlagRow handle={flags.flag("composer")}>
          <ChoiceOverride
            handle={flags.flag("composer")}
            options={BOOLEAN_OVERRIDES}
          />
        </FlagRow>
        <FlagRow handle={flags.flag("layout")}>
          <ChoiceOverride
            handle={flags.flag("layout")}
            options={LAYOUT_OVERRIDES}
          />
        </FlagRow>
        <FlagRow handle={flags.flag("uploads")}>
          <JsonOverride
            handle={flags.flag("uploads")}
            definition={courierFlags.uploads}
            example='{ "maxFiles": 20, "maxMegabytes": 100 }'
          />
        </FlagRow>
        <FlagRow handle={flags.flag("campaigns")}>
          <JsonOverride
            handle={flags.flag("campaigns")}
            definition={courierFlags.campaigns}
            example='{ "enabled": true, "dailyRecipients": 100000 }'
          />
        </FlagRow>
        <FlagRow handle={flags.flag("contactLimit")}>
          <JsonOverride
            handle={flags.flag("contactLimit")}
            definition={courierFlags.contactLimit}
            example="100"
          />
        </FlagRow>
        <FlagRow handle={flags.flag("maintenance")}>
          <JsonOverride
            handle={flags.flag("maintenance")}
            definition={courierFlags.maintenance}
            example='{ "message": "Read-only mode until 18:00." }'
          />
        </FlagRow>
      </ul>
    </Panel>
  );
};
