import type { RequestOutcome } from "examples/shared/courier/types/RequestOutcome";

export const getRequestOutcome = (
  response: Response | undefined,
): RequestOutcome => {
  if (response === undefined) {
    return "ABORTED";
  }

  if (response.ok) {
    return "OK";
  }

  return "FAILED";
};
