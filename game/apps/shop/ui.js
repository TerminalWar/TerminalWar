import { createTemplateAppView } from "../_templateApp/ui.js";

export function createShopView(appConfig) {
  const view = createTemplateAppView(appConfig);
  const economy = appConfig.economy || {};
  view.insertAdjacentHTML(
    "beforeend",
    `<section class="shop-preview">
      <h3>Cyber Shop balance knobs</h3>
      <div class="metric-row"><span>Starting cost</span><strong>${economy.startingCost ?? 0} credits</strong></div>
      <div class="metric-row"><span>Reward multiplier</span><strong>${economy.rewardMultiplier ?? 1}x</strong></div>
      <div class="metric-row"><span>Risk multiplier</span><strong>${economy.riskMultiplier ?? 1}x</strong></div>
    </section>`
  );
  return view;
}
