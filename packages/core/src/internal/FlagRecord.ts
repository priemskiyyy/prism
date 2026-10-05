import { PrismError } from "src/PrismError";
import { copyJson, isJsonEqual, shareJson } from "src/internal/json";
import type { Notify } from "src/internal/publish";
import { ValueStore } from "src/internal/ValueStore";
import type { DeclaredFlag } from "src/types/DeclaredFlag";
import type { Evaluation } from "src/types/Evaluation";
import type { FlagDefinition } from "src/types/FlagDefinition";
import type { FlagDetails } from "src/types/FlagDetails";
import type { FlagHandle } from "src/types/FlagHandle";
import type { JsonValue } from "src/types/JsonValue";
import type { Unsubscribe } from "src/types/Unsubscribe";

type Details = FlagDetails<unknown>;
type Input = { value: JsonValue; variant: string | undefined };

const noop = () => {};

const areDetailsEqual = (previous: Details, next: Details) => {
  if (!Object.is(previous.value, next.value)) {
    return false;
  }

  if (previous.resolution !== next.resolution) {
    return false;
  }

  if (previous.error !== next.error) {
    return false;
  }

  return previous.variant === next.variant;
};

const getProviderError = (key: string, cause: unknown) => {
  if (cause instanceof PrismError) {
    return new PrismError({
      code: cause.code,
      message: cause.message,
      key,
      cause,
    });
  }

  return new PrismError({ code: "EVALUATION_FAILED", key, cause });
};

const getValidationError = (key: string, cause: unknown) => {
  const reason =
    cause instanceof Error ? cause.message : "The value is invalid.";

  return new PrismError({
    code: "VALIDATION",
    message: `${key}: ${reason}`,
    key,
    cause,
  });
};

export class FlagRecord {
  declared: DeclaredFlag;
  handle: FlagHandle<unknown>;
  #key: string;
  #definition: FlagDefinition;
  #base: Details;
  #input: Input | undefined;
  #lease: Details | undefined;
  #closed = false;
  #details: ValueStore<Details>;

  constructor(key: string, providerKey: string, definition: FlagDefinition) {
    this.#key = key;
    this.#definition = definition;
    this.declared = { key: providerKey, fallback: definition.fallback };
    this.#base = this.#getFallbackDetails("pending");
    this.#details = new ValueStore<Details>(Object.freeze({ ...this.#base }));
    this.handle = Object.freeze({
      ...this.#details.select((details) => details.value),
      key,
      providerKey,
      details: this.#details.observable,
      override: (value: unknown) => this.#override(value),
    });
  }

  reset(): Notify {
    this.#lease = undefined;

    return this.#setBase(this.#getFallbackDetails("pending"), undefined);
  }

  receive(evaluations: Map<string, Evaluation>): Notify {
    const evaluation = evaluations.get(this.declared.key);

    if (evaluation === undefined) {
      return this.#setBase(this.#getFallbackDetails("missing"), undefined);
    }

    try {
      return this.#receiveEvaluation(evaluation);
    } catch (cause) {
      const error = getValidationError(this.#key, cause);

      return this.#setBase(this.#getErrorDetails(error), undefined);
    }
  }

  close() {
    this.#closed = true;
    this.#details.close();
  }

  #receiveEvaluation(evaluation: Evaluation): Notify {
    if ("error" in evaluation) {
      const error = getProviderError(this.#key, evaluation.error);

      return this.#setBase(this.#getErrorDetails(error), undefined);
    }

    if (this.#isUnchanged(evaluation.value, evaluation.variant)) {
      return noop;
    }

    const input = {
      value: copyJson(evaluation.value),
      variant: evaluation.variant,
    };

    return this.#setBase(this.#validate(input), input);
  }

  #isUnchanged(value: unknown, variant: string | undefined) {
    const input = this.#input;

    if (input === undefined || input.variant !== variant) {
      return false;
    }

    return isJsonEqual(value, input.value);
  }

  #validate({ value, variant }: Input): Details {
    try {
      return {
        value: this.#definition.validate(value),
        resolution: "resolved",
        ...(variant === undefined ? {} : { variant }),
      };
    } catch (cause) {
      return this.#getErrorDetails(getValidationError(this.#key, cause));
    }
  }

  #override(value: unknown): Unsubscribe {
    if (this.#closed) {
      throw new PrismError({ code: "DISPOSED", key: this.#key });
    }

    const lease: Details = {
      value: this.#definition.validate(value),
      resolution: "override",
    };

    this.#lease = lease;
    this.#installDetails()();

    return () => {
      if (this.#lease !== lease) {
        return;
      }

      this.#lease = undefined;
      this.#installDetails()();
    };
  }

  #getFallbackDetails(resolution: "pending" | "missing"): Details {
    return { value: this.#definition.fallback, resolution };
  }

  #getErrorDetails(error: PrismError): Details {
    return { value: this.#definition.fallback, resolution: "error", error };
  }

  #setBase(base: Details, input: Input | undefined): Notify {
    this.#base = base;
    this.#input = input;

    return this.#installDetails();
  }

  #installDetails(): Notify {
    const selected = this.#lease ?? this.#base;
    const previous = this.#details.observable.get();
    const value = shareJson(previous.value, selected.value);
    const next = Object.freeze({ ...selected, value });

    return this.#details.set(areDetailsEqual(previous, next) ? previous : next);
  }
}
