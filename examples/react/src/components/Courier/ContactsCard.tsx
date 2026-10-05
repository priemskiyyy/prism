import type React from "react";
import { AddressBook } from "@phosphor-icons/react";
import { useFlag } from "@priemskiyyy/prism-react";
import clsx from "clsx";
import { CONTACT_USAGE } from "examples/shared/courier/constants/contactUsage";
import type { WorkspaceId } from "examples/shared/courier/types/WorkspaceId";
import { formatCount } from "examples/shared/courier/utils/formatCount";

type ContactsCardProps = {
  workspaceId: WorkspaceId;
};

export const ContactsCard: React.FunctionComponent<ContactsCardProps> = ({
  workspaceId,
}) => {
  const limit = useFlag("contactLimit");
  const used = CONTACT_USAGE[workspaceId];
  const ratio = Math.min(used / limit, 1);

  return (
    <section
      aria-label="Contacts"
      className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <AddressBook aria-hidden="true" size={16} weight="duotone" />
        Contacts
      </p>
      <p className="flex items-baseline gap-1.5">
        <span className="text-xl font-semibold tabular-nums">
          {formatCount(used)}
        </span>
        <span className="text-xs text-zinc-500">of {formatCount(limit)}</span>
      </p>
      <div
        role="meter"
        aria-label="Contact usage"
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-valuenow={Math.min(used, limit)}
        className="h-1.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
      >
        <div
          className={clsx(
            "h-full rounded-full transition-all",
            ratio >= 1 ? "bg-rose-500" : "bg-indigo-500",
          )}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      {ratio >= 1 ? (
        <p className="text-xs text-rose-600 dark:text-rose-400">
          Over the limit, new contacts are paused.
        </p>
      ) : null}
    </section>
  );
};
