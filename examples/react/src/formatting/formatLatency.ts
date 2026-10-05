export const formatLatency = (latency: number) => {
  if (latency === 0) {
    return "Instant";
  }

  if (latency < 1_000) {
    return `${latency} ms`;
  }

  return `${latency / 1_000} s`;
};
