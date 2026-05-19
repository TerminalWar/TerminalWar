import { createElement } from "../../../shared/dom.js";
import { createTerminalView } from "./ui.js";
import { getTerminalBootText } from "./logic.js";

export function createApp(appConfig, context) {
  const view = createTerminalView(appConfig);
  view.prepend(createElement("p", { className: "boot-note", text: getTerminalBootText(context.operatorName) }));
  return view;
}
