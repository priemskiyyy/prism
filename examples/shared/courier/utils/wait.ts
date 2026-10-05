export const wait = (
  milliseconds: number,
  signal: AbortSignal | null | undefined,
) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new Error("The request was aborted."));

      return;
    }

    const timer = setTimeout(resolve, milliseconds);

    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(new Error("The request was aborted."));
      },
      { once: true },
    );
  });
