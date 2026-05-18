export function clearElement(element) {
  element.replaceChildren();
  return element;
}

export function createElement(tagName, options = {}, children = []) {
  const element = document.createElement(tagName);
  const {
    className,
    text,
    attributes = {},
    dataset = {},
    style = {},
    type,
    title,
    ariaLabel
  } = options;

  if (className) element.className = className;
  if (typeof text === "string") element.textContent = text;
  if (type) element.type = type;
  if (title) element.title = title;
  if (ariaLabel) element.setAttribute("aria-label", ariaLabel);

  for (const [name, value] of Object.entries(attributes)) {
    if (value === false || value === null || typeof value === "undefined") continue;
    if (value === true) element.setAttribute(name, "");
    else element.setAttribute(name, String(value));
  }

  for (const [name, value] of Object.entries(dataset)) {
    if (value !== null && typeof value !== "undefined") element.dataset[name] = String(value);
  }

  for (const [name, value] of Object.entries(style)) {
    if (value !== null && typeof value !== "undefined") element.style.setProperty(name, String(value));
  }

  appendChildren(element, children);
  return element;
}

export function appendChildren(parent, children = []) {
  for (const child of children.flat()) {
    if (child === null || typeof child === "undefined" || child === false) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

export function createIcon(src, alt = "") {
  return createElement("img", { attributes: { src, alt } });
}
