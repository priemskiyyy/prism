import { Show } from "solid-js";
import type { Component } from "solid-js";
import { useFlag } from "@priemskiyyy/prism-solid";
import { CONTACT_USAGE } from "examples/shared/courier/constants/contactUsage";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { formatCount } from "examples/shared/courier/utils/formatCount";
import { ICONS } from "examples/shared/ui/constants/icons";
import { BaseIcon } from "src/components/BaseIcon/BaseIcon";

type ContactsCardProps = {
  workspaceId: WorkspaceId;
};

export const ContactsCard: Component<ContactsCardProps> = (props) => {
  const limit = useFlag("contactLimit");
  const used = () => CONTACT_USAGE[props.workspaceId];
  const ratio = () => Math.min(used() / limit(), 1);

  return (
    <section
      aria-label="Contacts"
      class="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      <p class="flex items-center gap-2 text-sm font-medium">
        <BaseIcon src={ICONS.addressBook} size="regular" />
        Contacts
      </p>
      <p class="flex items-baseline gap-1.5">
        <span class="text-xl font-semibold tabular-nums">
          {formatCount(used())}
        </span>
        <span class="text-xs text-zinc-500">of {formatCount(limit())}</span>
      </p>
      <div
        role="meter"
        aria-label="Contact usage"
        aria-valuemin={0}
        aria-valuemax={limit()}
        aria-valuenow={Math.min(used(), limit())}
        class="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          class="h-full rounded-full transition-all"
          classList={{
            "bg-rose-500": ratio() >= 1,
            "bg-indigo-500": ratio() < 1,
          }}
          style={{ width: `${ratio() * 100}%` }}
        />
      </div>
      <Show when={ratio() >= 1}>
        <p class="text-xs text-rose-600 dark:text-rose-400">
          Over the limit, new contacts are paused.
        </p>
      </Show>
    </section>
  );
};
