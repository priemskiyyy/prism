import type {
  FlagDefinitions,
  FlagDetails,
  ObservableValue,
  PrismStatus,
  Unsubscribe,
} from "@priemskiyyy/prism";
import { createButton } from "src/internal/createButton";
import { createElement } from "src/internal/createElement";
import { createFlagList } from "src/internal/createFlagList";
import { createPanel } from "src/internal/createPanel";
import { createTimeline } from "src/internal/createTimeline";
import { formatStatus } from "src/internal/formatStatus";
import { getDevtoolsFlags } from "src/internal/getDevtoolsFlags";
import { getStatusState } from "src/internal/getStatusState";
import { readPreference, writePreference } from "src/internal/storage";
import type { DevtoolsFlag } from "src/types/DevtoolsFlag";
import type { DevtoolsTab } from "src/types/DevtoolsTab";
import type { PrismDevtoolsOptions } from "src/types/PrismDevtoolsOptions";
import {
  OPEN_PREFERENCE_KEY,
  TAB_PREFERENCE_KEY,
} from "src/utils/constants/preferences";
import { DEVTOOLS_STYLES } from "src/utils/constants/styles";

const noop = () => {};

export class PrismDevtools<S extends FlagDefinitions, C> {
  #status: ObservableValue<PrismStatus>;
  #refresh: () => Promise<void>;
  #flags: DevtoolsFlag[];
  #releases = new Map<string, Unsubscribe>();
  #subscriptions: Unsubscribe[] = [];
  #host: HTMLElement | undefined;

  constructor(options: PrismDevtoolsOptions<S, C>) {
    this.#status = options.flags.status;
    this.#refresh = () => options.flags.refresh();
    this.#flags = getDevtoolsFlags(options);
  }

  mount(container: HTMLElement) {
    if (this.#host !== undefined) {
      return;
    }

    const host = createElement("div", "", []);
    const shadow = host.attachShadow({ mode: "open" });

    shadow.append(
      createElement("style", "", [DEVTOOLS_STYLES]),
      ...this.#createView(),
    );
    container.append(host);
    this.#host = host;
  }

  unmount() {
    for (const unsubscribe of this.#subscriptions) {
      unsubscribe();
    }

    for (const release of this.#releases.values()) {
      release();
    }

    this.#subscriptions = [];
    this.#releases.clear();
    this.#host?.remove();
    this.#host = undefined;
  }

  #override = (flag: DevtoolsFlag, value: unknown) => {
    const validated = flag.definition.validate(value);

    this.#release(flag);
    this.#releases.set(flag.key, flag.handle.override(validated));
  };

  #release = (flag: DevtoolsFlag) => {
    this.#releases.get(flag.key)?.();
    this.#releases.delete(flag.key);
  };

  #createView() {
    const launcherLabel = createElement("span", "", ["Prism"]);

    const flagCount = createElement("span", "pill", [
      `${this.#flags.length} flags`,
    ]);

    const overrideCount = createElement("span", "pill", []);

    const launcher = createElement("button", "launcher", [
      createElement("span", "dot", []),
      launcherLabel,
      flagCount,
      overrideCount,
    ]);

    const statusText = createElement("span", "", []);

    const status = createElement("span", "status", [
      createElement("span", "dot", []),
      statusText,
    ]);

    const refresh = createButton("", "Refresh");
    const releaseAll = createButton("", "Release overrides");
    const dock = createButton("dock", "");
    const close = createButton("close", "×");

    const statusError = createElement("p", "error status-error", []);
    const flagsTab = createButton("", "Flags");
    const timelineTab = createButton("", "Timeline");

    const flagList = createFlagList({
      flags: this.#flags,
      override: (flag, value) => {
        this.#override(flag, value);
        flush();
      },
      release: (flag) => {
        this.#release(flag);
        flush();
      },
    });

    const timeline = createTimeline();

    const panel = createPanel({
      dock,
      children: [
        createElement("header", "header", [
          createElement("h2", "", ["Prism"]),
          status,
          close,
        ]),
        statusError,
        createElement("div", "tabs", [
          flagsTab,
          timelineTab,
          createElement("div", "actions", [refresh, releaseAll, dock]),
        ]),
        flagList.element,
        timeline.element,
      ],
    });

    const overridden = new Set<string>();

    let flushScheduled = false;

    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Prism devtools");
    overrideCount.dataset["tone"] = "accent";
    close.setAttribute("aria-label", "Close devtools");

    const isShowing = (view: HTMLElement) => !panel.hidden && !view.hidden;

    const renderOverrides = () => {
      overrideCount.textContent = `${overridden.size} overridden`;
      overrideCount.hidden = overridden.size === 0;
      releaseAll.disabled = this.#releases.size === 0;
    };

    const flush = () => {
      flushScheduled = false;
      renderOverrides();

      if (isShowing(flagList.element)) {
        flagList.render();
      }

      if (isShowing(timeline.element)) {
        timeline.render();
      }
    };

    const scheduleFlush = () => {
      if (flushScheduled) {
        return;
      }

      flushScheduled = true;
      queueMicrotask(flush);
    };

    const trackOverride = (key: string, details: FlagDetails<unknown>) => {
      if (details.resolution === "override") {
        overridden.add(key);

        return;
      }

      overridden.delete(key);
      this.#releases.delete(key);
    };

    const setOpen = (open: boolean) => {
      panel.hidden = !open;
      launcher.hidden = open;
      writePreference(OPEN_PREFERENCE_KEY, open ? "true" : "false");
      flush();
    };

    const setTab = (tab: DevtoolsTab) => {
      flagList.element.hidden = tab !== "FLAGS";
      timeline.element.hidden = tab !== "TIMELINE";
      flagsTab.setAttribute("aria-pressed", tab === "FLAGS" ? "true" : "false");
      timelineTab.setAttribute(
        "aria-pressed",
        tab === "TIMELINE" ? "true" : "false",
      );
      writePreference(TAB_PREFERENCE_KEY, tab);
      flush();
    };

    const renderStatus = (next: PrismStatus) => {
      const state = getStatusState(next);

      launcher.dataset["state"] = state;
      status.dataset["state"] = state;
      statusText.textContent = formatStatus(next);
      statusError.hidden = next.error === undefined;
      statusError.textContent =
        next.error === undefined
          ? ""
          : `${next.error.code} · ${next.error.message}`;
      refresh.disabled = next.state === "idle" || next.state === "disposed";
    };

    launcher.addEventListener("click", () => {
      setOpen(true);
      close.focus();
    });
    close.addEventListener("click", () => {
      setOpen(false);
      launcher.focus();
    });
    panel.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      setOpen(false);
      launcher.focus();
    });
    flagsTab.addEventListener("click", () => setTab("FLAGS"));
    timelineTab.addEventListener("click", () => setTab("TIMELINE"));
    refresh.addEventListener("click", () => {
      Promise.resolve().then(this.#refresh).catch(noop);
    });
    releaseAll.addEventListener("click", () => {
      for (const flag of this.#flags) {
        this.#release(flag);
      }

      flush();
    });

    renderStatus(this.#status.get());
    this.#subscriptions.push(
      this.#status.subscribe((next) => {
        renderStatus(next);
        timeline.record({ kind: "STATUS", status: next });
        scheduleFlush();
      }),
    );

    for (const flag of this.#flags) {
      const { key, handle } = flag;

      trackOverride(key, handle.details.get());
      this.#subscriptions.push(
        handle.details.subscribe((details) => {
          trackOverride(key, details);
          flagList.markStale(flag);
          timeline.record({ kind: "FLAG", key, details });
          scheduleFlush();
        }),
      );
    }

    setTab(
      readPreference(TAB_PREFERENCE_KEY) === "TIMELINE" ? "TIMELINE" : "FLAGS",
    );
    setOpen(readPreference(OPEN_PREFERENCE_KEY) === "true");

    return [launcher, panel];
  }
}
