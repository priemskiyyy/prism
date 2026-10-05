import { createButton } from "src/internal/createButton";
import { createElement } from "src/internal/createElement";
import { createEventRow } from "src/internal/createEventRow";
import type { DevtoolsEntry } from "src/types/DevtoolsEntry";
import type { DevtoolsEvent } from "src/types/DevtoolsEvent";
import { TIMELINE_LENGTH } from "src/utils/constants/timeline";

export const createTimeline = () => {
  const pause = createButton("", "Pause");
  const clear = createButton("", "Clear");
  const total = createElement("span", "total", []);
  const events = createElement("ol", "list", []);

  const empty = createElement("p", "empty", [
    "Status changes and flag updates appear here as the runtime publishes them.",
  ]);

  const element = createElement("div", "view", [
    createElement("div", "toolbar", [pause, clear, total]),
    events,
    empty,
  ]);

  const recorded: DevtoolsEvent[] = [];

  let paused = false;
  let nextEventId = 1;
  let renderedEventId = 0;

  events.setAttribute("aria-label", "Timeline");
  pause.setAttribute("aria-pressed", "false");

  const render = () => {
    const fresh = recorded
      .filter(({ id }) => id > renderedEventId)
      .reverse()
      .map((event) => createEventRow(event));

    events.prepend(...fresh);
    renderedEventId = nextEventId - 1;

    while (events.childElementCount > TIMELINE_LENGTH) {
      events.lastElementChild?.remove();
    }

    total.textContent = `${recorded.length} events`;
    empty.hidden = recorded.length > 0;
  };

  const record = (entry: DevtoolsEntry) => {
    if (paused) {
      return;
    }

    recorded.push({ ...entry, id: nextEventId, at: Date.now() });
    nextEventId += 1;

    if (recorded.length > TIMELINE_LENGTH) {
      recorded.shift();
    }
  };

  pause.addEventListener("click", () => {
    paused = !paused;
    pause.textContent = paused ? "Resume" : "Pause";
    pause.setAttribute("aria-pressed", paused ? "true" : "false");
  });
  clear.addEventListener("click", () => {
    recorded.splice(0);
    events.replaceChildren();
    render();
  });

  return { element, record, render };
};
