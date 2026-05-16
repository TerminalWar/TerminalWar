import { createTemplateAppView } from "./ui.js";
import { getAppStatus } from "./logic.js";

export function createApp(appConfig) {
  const view = createTemplateAppView(appConfig);
  const status = getAppStatus(appConfig);
  view.insertAdjacentHTML(
    "beforeend",
    `<aside class="app-status-pill ${status.locked ? "is-locked" : ""}">${status.label}: ${status.details}</aside>`
  );
  return view;
}
