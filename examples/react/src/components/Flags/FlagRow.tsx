import type React from "react";
import type { FlagHandle } from "@priemskiyyy/prism";
import { useFlagDetails } from "@priemskiyyy/prism-react";
import type { ReactNode } from "react";
import { Badge } from "src/components/Badge/Badge";
import { ResolutionBadge } from "src/components/Badge/ResolutionBadge";
import { formatJson } from "src/formatting/formatJson";

type FlagRowProps = { handle: FlagHandle<unknown>; children: ReactNode };

export const FlagRow: React.FunctionComponent<FlagRowProps> = ({
  handle,
  children,
}) => {
  const details = useFlagDetails(handle);

  return (
    <li
      id={`flag-${handle.key}`}
      aria-label={handle.key}
      className="grid scroll-mt-32 gap-3 py-4 lg:grid-cols-[11rem_minmax(0,1fr)_minmax(0,23rem)] lg:items-start"
    >
      <div className="flex min-w-0 flex-col">
        <code className="text-base font-semibold">{handle.key}</code>
        {handle.providerKey === handle.key ? null : (
          <span className="font-mono text-xs text-zinc-500">
            {handle.providerKey}
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <ResolutionBadge resolution={details.resolution} />
          {details.variant === undefined ? null : (
            <Badge tone="neutral">{details.variant}</Badge>
          )}
        </div>
        <code
          key={formatJson(details.value)}
          className="animate-flash self-start rounded-md font-mono text-sm break-all text-zinc-700 motion-reduce:animate-none dark:text-zinc-300"
        >
          {formatJson(details.value)}
        </code>
        {details.error === undefined ? null : (
          <p className="text-sm break-words text-rose-600 dark:text-rose-400">
            {details.error.code} · {details.error.message}
          </p>
        )}
      </div>
      <div className="min-w-0">{children}</div>
    </li>
  );
};
