import { ErrorCode } from "@openfeature/web-sdk";
import type { PrismErrorCode } from "@priemskiyyy/prism";

export const ERROR_CODES = {
  [ErrorCode.PROVIDER_NOT_READY]: "EVALUATION_FAILED",
  [ErrorCode.PROVIDER_FATAL]: "EVALUATION_FAILED",
  [ErrorCode.FLAG_NOT_FOUND]: "EVALUATION_FAILED",
  [ErrorCode.PARSE_ERROR]: "VALIDATION",
  [ErrorCode.TYPE_MISMATCH]: "VALIDATION",
  [ErrorCode.TARGETING_KEY_MISSING]: "INVALID_CONTEXT",
  [ErrorCode.INVALID_CONTEXT]: "INVALID_CONTEXT",
  [ErrorCode.GENERAL]: "EVALUATION_FAILED",
} satisfies Record<ErrorCode, PrismErrorCode>;
