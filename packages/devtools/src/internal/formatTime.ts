const clock = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

export const formatTime = (at: number) => {
  const date = new Date(at);
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");

  return `${clock.format(date)}.${milliseconds}`;
};
