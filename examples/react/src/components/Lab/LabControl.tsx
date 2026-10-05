import type React from "react";
import type { Icon } from "@phosphor-icons/react";
import { useId } from "react";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";

type LabControlProps = {
  icon: Icon;
  label: string;
  description: string;
  pressed: boolean;
  disabled: boolean;
  onPress: () => void;
};

export const LabControl: React.FunctionComponent<LabControlProps> = ({
  icon: ControlIcon,
  label,
  description,
  pressed,
  disabled,
  onPress,
}) => {
  const descriptionId = useId();

  return (
    <li className="flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 sm:odd:last:col-span-2 dark:border-zinc-800">
      <button
        type="button"
        aria-pressed={pressed}
        aria-describedby={descriptionId}
        disabled={disabled}
        onClick={onPress}
        className={buttonStyles({ pressed })}
      >
        <ControlIcon aria-hidden="true" size={16} weight="bold" />
        {label}
      </button>
      <p
        id={descriptionId}
        className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400"
      >
        {description}
      </p>
    </li>
  );
};
