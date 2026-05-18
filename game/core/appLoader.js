import { APP_CONFIGS } from "../config/apps.config.js";
import { getOperatorName } from "./state.js";
import { GAME_CONFIG } from "../config/game.config.js";

const APP_MODULES = {
  terminal: () => import("../apps/terminal/index.js"),
  shop: () => import("../apps/shop/index.js"),
  template: () => import("../apps/_templateApp/index.js")
};

export function getApps() {
  return APP_CONFIGS;
}

export function getAppBySlug(slug) {
  return APP_CONFIGS.find((app) => app.slug.toLowerCase() === slug?.toLowerCase());
}

export function getDesktopApps() {
  return APP_CONFIGS.filter((app) => app.desktopShortcut);
}

export function getPinnedApps(pinnedIds = null) {
  if (Array.isArray(pinnedIds) && pinnedIds.length > 0) {
    return pinnedIds.map((id) => APP_CONFIGS.find((app) => app.id === id)).filter(Boolean);
  }

  return APP_CONFIGS.filter((app) => app.taskbarPinned);
}

export function getRouteSlugFromLocation(location = window.location) {
  const parts = location.pathname.split("/").filter(Boolean);
  const gameIndex = parts.indexOf("game");
  return gameIndex >= 0 ? parts[gameIndex + 1] : null;
}

export function routeToApp(app) {
  const target = `/game/${app.slug}/`;
  if (window.location.pathname !== target) {
    window.history.pushState({ appSlug: app.slug }, "", target);
  }
}

export async function createAppContent(appConfig) {
  const moduleLoader = APP_MODULES[appConfig.slug] || APP_MODULES.template;
  const module = await moduleLoader();
  const operatorName = getOperatorName(GAME_CONFIG.session.fallbackOperator);
  return module.createApp(appConfig, { operatorName });
}
