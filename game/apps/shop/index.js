import { createElement } from "../../../shared/dom.js";
import { createShopView } from "./ui.js";
import { getShopNotice } from "./logic.js";

export function createApp(appConfig) {
  const view = createShopView(appConfig);
  view.prepend(createElement("p", { className: "boot-note", text: getShopNotice() }));
  return view;
}
