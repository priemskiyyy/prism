import type { FlagHandle, Unsubscribe } from "@priemskiyyy/prism";
import { useFlagDetails } from "@priemskiyyy/prism-react";
import { useRef } from "react";
import { SegmentedControl } from "src/components/SegmentedControl/SegmentedControl";
import type { Option } from "src/types/Option";
import { getSelectedOverrideLabel } from "src/utils/getSelectedOverrideLabel";
import { PROVIDER_LABEL } from "src/utils/constants/labels";

type ChoiceOverrideProps<T> = { handle: FlagHandle<T>; options: Option<T>[] };

export const ChoiceOverride = <T extends string | boolean>({
  handle,
  options,
}: ChoiceOverrideProps<T>) => {
  const details = useFlagDetails(handle);
  const release = useRef<Unsubscribe | undefined>(undefined);

  const labels: Option<string>[] = [
    { value: PROVIDER_LABEL, label: PROVIDER_LABEL },
    ...options.map(({ label }) => ({ value: label, label })),
  ];

  const handleSelect = (label: string) => {
    release.current?.();
    release.current = undefined;

    const option = options.find((candidate) => candidate.label === label);

    if (option === undefined) {
      return;
    }

    release.current = handle.override(option.value);
  };

  return (
    <SegmentedControl
      label={`Override ${handle.key}`}
      options={labels}
      value={getSelectedOverrideLabel(details, options)}
      disabled={false}
      onSelect={handleSelect}
    />
  );
};
