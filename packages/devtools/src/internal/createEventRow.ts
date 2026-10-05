import { createElement } from "src/internal/createElement";
import { formatStatus } from "src/internal/formatStatus";
import { formatTime } from "src/internal/formatTime";
import { formatValue } from "src/internal/formatValue";
import type { DevtoolsEvent } from "src/types/DevtoolsEvent";

const getEventText = (event: DevtoolsEvent) => {
  if (event.kind === "STATUS") {
    const error =
      event.status.error === undefined ? "" : ` · ${event.status.error.code}`;

    return `status ${formatStatus(event.status)}${error}`;
  }

  return `${event.key} ${event.details.resolution} ${formatValue(event.details.value)}`;
};

export const createEventRow = (event: DevtoolsEvent) => {
  const description = getEventText(event);
  const time = createElement("time", "", [formatTime(event.at)]);
  const text = createElement("span", "event-text", [description]);
  const element = createElement("li", "event", [time, text]);

  time.dateTime = new Date(event.at).toISOString();
  text.title = description;
  element.dataset["kind"] = event.kind;

  if (event.kind === "FLAG") {
    element.dataset["resolution"] = event.details.resolution;
  }

  return element;
};
