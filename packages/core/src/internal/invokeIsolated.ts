import { reportUnhandledError } from "src/internal/reportUnhandledError";

export const invokeIsolated = (callback: () => void | Promise<unknown>) => {
  try {
    const result = callback();

    if (result === undefined) {
      return;
    }

    Promise.resolve(result).catch(reportUnhandledError);
  } catch (error) {
    reportUnhandledError(error);
  }
};
