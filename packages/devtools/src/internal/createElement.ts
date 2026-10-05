export const createElement = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  children: (Node | string)[],
) => {
  const element = document.createElement(tag);

  element.className = className;
  element.append(...children);

  return element;
};
