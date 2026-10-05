import type React from "react";
import { Lock, Megaphone } from "@phosphor-icons/react";
import { useFlag } from "@priemskiyyy/prism-react";
import { formatCount } from "examples/shared/courier/utils/formatCount";

export const CampaignsCard: React.FunctionComponent = () => {
  const campaigns = useFlag("campaigns");

  return (
    <section
      aria-label="Broadcasts"
      className="flex flex-col gap-2 rounded-xl bg-white p-3 shadow-sm ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
    >
      <p className="flex items-center gap-2 text-sm font-medium">
        <Megaphone aria-hidden="true" size={16} weight="duotone" />
        Broadcasts
      </p>
      {campaigns.enabled ? (
        <p className="flex items-baseline gap-1.5">
          <span className="text-xl font-semibold tabular-nums">
            {formatCount(campaigns.dailyRecipients)}
          </span>
          <span className="text-xs text-zinc-500">recipients a day</span>
        </p>
      ) : (
        <p className="flex items-start gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
          <Lock aria-hidden="true" size={14} weight="bold" className="mt-px" />
          Admins on Business and Enterprise send broadcasts.
        </p>
      )}
    </section>
  );
};
