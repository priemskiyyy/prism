export type PrismErrorCode =
  | "INVALID_CONFIGURATION"
  | "INVALID_CONTEXT"
  | "NOT_STARTED"
  | "DISPOSED"
  | "TIMEOUT"
  | "NETWORK"
  | "AUTHENTICATION"
  | "FORBIDDEN"
  | "RATE_LIMITED"
  | "PROTOCOL"
  | "CONTEXT_CONFLICT"
  | "EVALUATION_FAILED"
  | "VALIDATION";

export type PrismErrorOptions = {
  code: PrismErrorCode;
  message?: string | undefined;
  key?: string | undefined;
  cause?: unknown;
};

export class PrismError extends Error {
  code: PrismErrorCode;
  key: string | undefined;

  constructor({ code, message, key, cause }: PrismErrorOptions) {
    super(message ?? `Prism ${code}`, { cause });
    this.name = "PrismError";
    this.code = code;
    this.key = key;
  }
}

export const toPrismError = (
  cause: unknown,
  code: PrismErrorCode,
): PrismError => {
  if (cause instanceof PrismError) {
    return cause;
  }

  return new PrismError({ code, cause });
};
