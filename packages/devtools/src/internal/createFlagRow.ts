import type { FlagDetails } from "@priemskiyyy/prism";
import { createElement } from "src/internal/createElement";
import { formatJson } from "src/internal/formatJson";
import { formatValue } from "src/internal/formatValue";
import type { DevtoolsFlag } from "src/types/DevtoolsFlag";
import type { FlagRow } from "src/types/FlagRow";

type FlagRowOptions = {
  flag: DevtoolsFlag;
  override: (flag: DevtoolsFlag, value: unknown) => void;
  release: (flag: DevtoolsFlag) => void;
};

const createFact = (term: string) => {
  const value = createElement("dd", "", []);

  return {
    value,
    elements: [createElement("dt", "", [term]), value],
  };
};

export const createFlagRow = ({
  flag,
  override,
  release,
}: FlagRowOptions): FlagRow => {
  const { key, handle } = flag;
  const resolution = createElement("span", "resolution", []);
  const value = createElement("code", "flag-value", []);

  const summary = createElement("button", "flag-summary", [
    createElement("span", "flag-key", [key]),
    resolution,
    value,
  ]);

  const provider = createFact("Provider key");
  const variant = createFact("Variant");
  const error = createFact("Error");
  const json = createElement("pre", "json", []);
  const input = createElement("textarea", "", []);
  const problem = createElement("p", "error", []);
  const apply = createElement("button", "primary", ["Override"]);
  const releaseButton = createElement("button", "", ["Release"]);

  const form = createElement("form", "override", [
    input,
    createElement("div", "buttons", [apply, releaseButton]),
    problem,
  ]);

  const detail = createElement("div", "flag-detail", [
    createElement("dl", "facts", [
      ...provider.elements,
      ...variant.elements,
      ...error.elements,
    ]),
    json,
    form,
  ]);

  const element = createElement("li", "flag", [summary, detail]);

  let current: FlagDetails<unknown> | undefined;

  const renderDetail = () => {
    if (current === undefined || detail.hidden) {
      return;
    }

    json.textContent = formatJson(current.value);
    variant.value.textContent = current.variant ?? "none";
    error.value.textContent =
      current.error === undefined
        ? "none"
        : `${current.error.code} · ${current.error.message}`;
  };

  element.setAttribute("aria-label", key);
  summary.type = "button";
  summary.setAttribute("aria-expanded", "false");
  apply.type = "submit";
  releaseButton.type = "button";
  input.setAttribute("aria-label", `${key} override`);
  input.spellcheck = false;
  problem.hidden = true;
  detail.hidden = true;
  provider.value.textContent = handle.providerKey;

  summary.addEventListener("click", () => {
    const expanded = detail.hidden;

    detail.hidden = !expanded;
    summary.setAttribute("aria-expanded", expanded ? "true" : "false");

    if (!expanded) {
      return;
    }

    input.value = formatJson(handle.get());
    renderDetail();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    try {
      const parsed: unknown = JSON.parse(input.value);

      override(flag, parsed);
      problem.hidden = true;
    } catch (cause) {
      problem.textContent =
        cause instanceof Error ? cause.message : "The value is invalid.";
      problem.hidden = false;
    }
  });

  releaseButton.addEventListener("click", () => {
    release(flag);
  });

  return {
    element,
    update: (details: FlagDetails<unknown>) => {
      if (details === current) {
        return;
      }

      current = details;
      element.dataset["resolution"] = details.resolution;
      resolution.dataset["resolution"] = details.resolution;
      resolution.textContent = details.resolution;
      value.textContent = formatValue(details.value);
      releaseButton.disabled = details.resolution !== "override";
      renderDetail();
    },
    filter: (query: string) => {
      element.hidden = !key.toLowerCase().includes(query.trim().toLowerCase());
    },
  };
};
