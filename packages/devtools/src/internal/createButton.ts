import { createElement } from "src/internal/createElement";

export const createButton = (className: string, label: string) => {
  const button = createElement("button", className, [label]);

  button.type = "button";

  return button;
};
