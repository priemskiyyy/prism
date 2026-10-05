import type React from "react";
import { Flag } from "@phosphor-icons/react";
import { useFlagDetails } from "@priemskiyyy/prism-react";
import type { RegisteredKey } from "@priemskiyyy/prism-react";
import clsx from "clsx";
import { RESOLUTION_TONES } from "examples/shared/ui/constants/tones";
import { dotStyles } from "examples/shared/ui/styles/dotStyles";
import { formatJson } from "src/formatting/formatJson";
import { scrollToElement } from "src/utils/scrollToElement";

type FlagChipProps = { flagKey: RegisteredKey };

export const FlagChip: React.FunctionComponent<FlagChipProps> = ({
  flagKey,
}) => {
  const { resolution, value } = useFlagDetails(flagKey);

  return (
    <button
      key={`${resolution}:${formatJson(value)}`}
      type="button"
      title={`${flagKey} is ${resolution}. Open it in the flag inspector.`}
      onClick={() => scrollToElement(`flag-${flagKey}`)}
      className={clsx(
        "inline-flex shrink-0 animate-flash items-center gap-1.5 rounded-full border border-dashed px-2.5 py-0.5 font-mono text-xs transition motion-reduce:animate-none",
        "border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-zinc-900 dark:text-indigo-300 dark:hover:bg-indigo-950",
      )}
    >
      <Flag aria-hidden="true" size={12} weight="bold" />
      {flagKey}
      <span
        aria-hidden="true"
        className={dotStyles({ tone: RESOLUTION_TONES[resolution] })}
      />
    </button>
  );
};
