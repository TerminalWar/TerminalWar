import { createShopView } from "./ui.js";
import { getShopNotice } from "./logic.js";

export function createApp(appConfig) {
  const view = createShopView(appConfig);
  view.insertAdjacentHTML("afterbegin", `<p class="boot-note">${getShopNotice()}</p>`);
  return view;
}
