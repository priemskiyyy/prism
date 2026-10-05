import type { FlagDefinitions, Prism } from "@priemskiyyy/prism";
import { useEffect, useRef } from "react";
import { PrismDevtools as DevtoolsPanel } from "src/PrismDevtools";

type PrismDevtoolsProps<S extends FlagDefinitions, C> = {
  flags: Prism<S, C>;
  definitions: S;
};

export const PrismDevtools = <S extends FlagDefinitions, C>({
  flags,
  definitions,
}: PrismDevtoolsProps<S, C>) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = container.current;

    if (element === null) {
      return;
    }

    const devtools = new DevtoolsPanel({ flags, definitions });

    devtools.mount(element);

    return () => {
      devtools.unmount();
    };
  }, [flags, definitions]);

  return <div ref={container} />;
};
