import { createElement } from "../../../shared/dom.js";
import { createTemplateAppView } from "../_templateApp/ui.js";

function createMetric(label, value) {
  return createElement("div", { className: "metric-row" }, [
    createElement("span", { text: label }),
    createElement("strong", { text: value })
  ]);
}

export function createShopView(appConfig) {
  const view = createTemplateAppView(appConfig);
  const economy = appConfig.economy || {};
  view.append(createElement("section", { className: "shop-preview" }, [
    createElement("h3", { text: "Cyber Shop balance knobs" }),
    createMetric("Starting cost", `${economy.startingCost ?? 0} credits`),
    createMetric("Reward multiplier", `${economy.rewardMultiplier ?? 1}x`),
    createMetric("Risk multiplier", `${economy.riskMultiplier ?? 1}x`)
  ]));
  return view;
}
