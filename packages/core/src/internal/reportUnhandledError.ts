export const reportUnhandledError = (error: unknown) => {
  queueMicrotask(() => {
    throw error;
  });
};
