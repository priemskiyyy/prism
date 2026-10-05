// @vitest-environment jsdom
import { Prism, flag } from "@priemskiyyy/prism";
import { createMockAdapter } from "@priemskiyyy/prism/mock";
import { afterEach, expect, test } from "vitest";
import { z } from "zod";
import { PrismDevtools } from "src/PrismDevtools";

const definitions = {
  enabled: flag(z.boolean(), { fallback: false }),
  limits: flag(z.object({ maxFiles: z.number().int().max(20) }), {
    fallback: { maxFiles: 1 },
  }),
};

const createFlags = () =>
  new Prism({
    flags: definitions,
    adapter: createMockAdapter({
      evaluate: () => ({
        enabled: { value: true },
        limits: { value: { maxFiles: 5 } },
      }),
    }),
  });

const mount = (flags: ReturnType<typeof createFlags>) => {
  const container = document.body.appendChild(document.createElement("div"));
  const devtools = new PrismDevtools({ flags, definitions });

  devtools.mount(container);

  const shadow = container.firstElementChild?.shadowRoot;

  if (shadow === null || shadow === undefined) {
    throw new Error("Expected the devtools shadow root.");
  }

  const query = <E extends Element>(selector: string, type: new () => E) => {
    const element = shadow.querySelector(selector);

    if (!(element instanceof type)) {
      throw new Error(`Expected ${selector}.`);
    }

    return element;
  };

  return { container, devtools, shadow, query };
};

const getButton = (root: ParentNode, label: string) => {
  const button = [...root.querySelectorAll("button")].find(
    (candidate) => candidate.textContent === label,
  );

  if (button === undefined) {
    throw new Error(`Expected the ${label} button.`);
  }

  return button;
};

afterEach(() => {
  document.body.replaceChildren();
  window.localStorage.clear();
});

test("shows every flag's resolution and value as the runtime publishes them", async () => {
  const flags = createFlags();
  const { container, devtools, shadow, query } = mount(flags);

  query(".launcher", HTMLButtonElement).click();
  expect(shadow.querySelectorAll(".flag")).toHaveLength(2);
  expect(query(".flag .resolution", HTMLElement).textContent).toBe("pending");
  await flags.start({ context: {} });
  expect(query(".flag .resolution", HTMLElement).textContent).toBe("resolved");
  expect(query(".flag .flag-value", HTMLElement).textContent).toBe("true");
  expect(query(".status", HTMLElement).dataset["state"]).toBe("ready");
  devtools.unmount();
  expect(container.childElementCount).toBe(0);
  await flags.dispose();
});

test("an override passes the flag's schema and is released on unmount", async () => {
  const flags = createFlags();
  const { devtools, shadow } = mount(flags);
  const [, limits] = shadow.querySelectorAll(".flag");

  await flags.start({ context: {} });

  const summary = limits?.querySelector(".flag-summary");
  const input = limits?.querySelector("textarea");
  const apply = limits?.querySelector(".primary");
  const problem = limits?.querySelector(".error");

  if (
    !(summary instanceof HTMLButtonElement) ||
    !(input instanceof HTMLTextAreaElement) ||
    !(apply instanceof HTMLButtonElement) ||
    !(problem instanceof HTMLElement)
  ) {
    throw new Error("Expected the limits row controls.");
  }

  summary.click();
  expect(input.value).toBe('{\n  "maxFiles": 5\n}');
  input.value = '{ "maxFiles": 50 }';
  apply.click();
  expect(problem.hidden).toBe(false);
  expect(problem.textContent).toContain("maxFiles");
  expect(flags.flag("limits").details.get().resolution).toBe("resolved");
  input.value = '{ "maxFiles": 9 }';
  apply.click();
  expect(problem.hidden).toBe(true);
  expect(flags.flag("limits").details.get()).toMatchObject({
    value: { maxFiles: 9 },
    resolution: "override",
  });

  const releaseAll = getButton(shadow, "Release overrides");

  expect(releaseAll.disabled).toBe(false);
  releaseAll.click();
  expect(flags.flag("limits").details.get().resolution).toBe("resolved");
  expect(releaseAll.disabled).toBe(true);
  input.value = '{ "maxFiles": 7 }';
  apply.click();
  devtools.unmount();
  expect(flags.flag("limits").details.get().resolution).toBe("resolved");
  await flags.dispose();
});

test("the launcher opens the panel and the choice survives a remount", () => {
  const flags = createFlags();
  const first = mount(flags);
  const launcher = first.query(".launcher", HTMLButtonElement);
  const panel = first.query(".panel", HTMLElement);

  expect(panel.hidden).toBe(true);
  launcher.click();
  expect(panel.hidden).toBe(false);
  expect(launcher.hidden).toBe(true);
  first.devtools.unmount();

  const second = mount(flags);

  expect(second.query(".panel", HTMLElement).hidden).toBe(false);
  second.devtools.unmount();
});

test("the timeline records status and flag updates until it is paused", async () => {
  const flags = createFlags();
  const { devtools, shadow, query } = mount(flags);

  query(".launcher", HTMLButtonElement).click();
  getButton(shadow, "Timeline").click();
  expect(query(".view:last-of-type", HTMLElement).hidden).toBe(false);
  await flags.start({ context: {} });

  const recorded = shadow.querySelectorAll(".event").length;

  expect(recorded).toBeGreaterThan(0);

  const pause = getButton(shadow, "Pause");

  pause.click();
  await flags.refresh();
  expect(shadow.querySelectorAll(".event")).toHaveLength(recorded);
  devtools.unmount();
  await flags.dispose();
});

test("a closed panel renders nothing until it opens and then catches up", async () => {
  const flags = createFlags();
  const { devtools, shadow, query } = mount(flags);

  await flags.start({ context: {} });
  flags.flag("enabled").override(false);
  await Promise.resolve();
  expect(query(".flag .resolution", HTMLElement).textContent).toBe("");
  expect(shadow.querySelectorAll(".event")).toHaveLength(0);
  expect(query(".launcher [data-tone]", HTMLElement).textContent).toBe(
    "1 overridden",
  );
  query(".launcher", HTMLButtonElement).click();
  expect(query(".flag .resolution", HTMLElement).textContent).toBe("override");
  getButton(shadow, "Timeline").click();
  expect(shadow.querySelectorAll(".event").length).toBeGreaterThan(0);
  expect(query(".total", HTMLElement).textContent).toBe(
    `${shadow.querySelectorAll(".event").length} events`,
  );
  devtools.unmount();
  await flags.dispose();
});

test("the arrow keys resize the panel and docking keeps a size per edge", () => {
  const flags = createFlags();
  const first = mount(flags);
  const panel = first.query(".panel", HTMLElement);
  const resize = first.query(".resize", HTMLElement);
  const dock = first.query(".dock", HTMLButtonElement);

  expect(panel.dataset["position"]).toBe("BOTTOM");
  expect(panel.style.getPropertyValue("--panel-size")).toBe("360px");
  resize.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
  expect(panel.style.getPropertyValue("--panel-size")).toBe("384px");
  dock.click();
  expect(panel.dataset["position"]).toBe("RIGHT");
  expect(panel.style.getPropertyValue("--panel-size")).toBe("480px");
  resize.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight" }));
  expect(panel.style.getPropertyValue("--panel-size")).toBe("456px");
  first.devtools.unmount();

  const second = mount(flags);

  expect(second.query(".panel", HTMLElement).dataset["position"]).toBe("RIGHT");
  expect(
    second.query(".panel", HTMLElement).style.getPropertyValue("--panel-size"),
  ).toBe("456px");
  second.query(".dock", HTMLButtonElement).click();
  expect(
    second.query(".panel", HTMLElement).style.getPropertyValue("--panel-size"),
  ).toBe("384px");
  second.devtools.unmount();
});
