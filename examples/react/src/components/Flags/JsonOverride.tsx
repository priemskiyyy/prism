import type {
  FlagDefinition,
  FlagHandle,
  JsonValue,
  Unsubscribe,
} from "@priemskiyyy/prism";
import { useFlagDetails } from "@priemskiyyy/prism-react";
import clsx from "clsx";
import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { buttonStyles } from "examples/shared/ui/styles/buttonStyles";
import { FIELD_CLASS_NAME } from "examples/shared/ui/styles/fieldStyles";

type JsonOverrideProps<T extends JsonValue> = {
  handle: FlagHandle<T>;
  definition: FlagDefinition<T>;
  example: string;
};

export const JsonOverride = <T extends JsonValue>({
  handle,
  definition,
  example,
}: JsonOverrideProps<T>) => {
  const resolution = useFlagDetails(handle, (details) => details.resolution);
  const [text, setText] = useState(example);
  const [problem, setProblem] = useState<string | undefined>(undefined);
  const release = useRef<Unsubscribe | undefined>(undefined);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const input: unknown = JSON.parse(text);
      const value = definition.validate(input);

      release.current?.();
      release.current = handle.override(value);
      setProblem(undefined);
    } catch (error) {
      setProblem(error instanceof Error ? error.message : "Invalid value.");
    }
  };

  const handleReleasePress = () => {
    release.current?.();
    release.current = undefined;
  };

  return (
    <form
      aria-label={`Override ${handle.key}`}
      onSubmit={handleSubmit}
      className="flex flex-col gap-1.5"
    >
      <div className="flex min-w-0 gap-1.5">
        <input
          aria-label={`${handle.key} override`}
          value={text}
          spellCheck={false}
          onChange={(event) => setText(event.target.value)}
          className={clsx(FIELD_CLASS_NAME, "h-8 py-1 font-mono text-sm")}
        />
        <button type="submit" className={buttonStyles({ size: "small" })}>
          Override
        </button>
        <button
          type="button"
          disabled={resolution !== "override"}
          onClick={handleReleasePress}
          className={buttonStyles({ size: "small", variant: "ghost" })}
        >
          Release
        </button>
      </div>
      {problem === undefined ? null : (
        <p role="alert" className="text-sm text-rose-600 dark:text-rose-400">
          {problem}
        </p>
      )}
    </form>
  );
};
