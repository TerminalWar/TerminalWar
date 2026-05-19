import { createElement } from "../../../shared/dom.js";
import { createTemplateAppView } from "./ui.js";
import { getAppStatus } from "./logic.js";

export function createApp(appConfig) {
  const view = createTemplateAppView(appConfig);
  const status = getAppStatus(appConfig);
  view.append(createElement("aside", { className: `app-status-pill ${status.locked ? "is-locked" : ""}`.trim(), text: `${status.label}: ${status.details}` }));
  return view;
}
