import type { FlagDefinitions, FlagKey } from "@priemskiyyy/prism";
import type { DevtoolsFlag } from "src/types/DevtoolsFlag";
import type { PrismDevtoolsOptions } from "src/types/PrismDevtoolsOptions";

const isFlagKey = <S extends FlagDefinitions>(
  definitions: S,
  key: string,
): key is FlagKey<S> => key in definitions;

export const getDevtoolsFlags = <S extends FlagDefinitions, C>({
  flags,
  definitions,
}: PrismDevtoolsOptions<S, C>): DevtoolsFlag[] =>
  Object.entries(definitions).flatMap(([key, definition]) => {
    if (!isFlagKey(definitions, key)) {
      return [];
    }

    return [{ key, handle: flags.flag(key), definition }];
  });
