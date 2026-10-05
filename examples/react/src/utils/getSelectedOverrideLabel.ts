import type { FlagDetails } from "@priemskiyyy/prism";
import type { Option } from "src/types/Option";
import { PROVIDER_LABEL } from "src/utils/constants/labels";

export const getSelectedOverrideLabel = <T>(
  details: FlagDetails<T>,
  options: Option<T>[],
) => {
  if (details.resolution !== "override") {
    return PROVIDER_LABEL;
  }

  const option = options.find((candidate) => candidate.value === details.value);

  return option?.label ?? PROVIDER_LABEL;
};
