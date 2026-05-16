import { createTerminalView } from "./ui.js";
import { getTerminalBootText } from "./logic.js";

export function createApp(appConfig, context) {
  const view = createTerminalView(appConfig);
  view.insertAdjacentHTML("afterbegin", `<p class="boot-note">${getTerminalBootText(context.operatorName)}</p>`);
  return view;
}
