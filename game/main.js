import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { applyViewportProfile } from "../shared/device.js";
import { goToLogin } from "../shared/navigation.js";
import { getAppBySlug, getRouteSlugFromLocation } from "./core/appLoader.js";
import { getAppAccess } from "./core/appAccess.js";
import { renderDesktop } from "./core/desktop.js";
import { ensurePlayerGameProfile, mergePlayerProfile } from "./core/playerStore.js";
import { desktopState, setPlayerProfile, setUser } from "./core/state.js";
import { initTaskbar, refreshTaskbarWindows } from "./core/taskbar.js";
import { closeAllWindows, initWindowManager, openAppWindow } from "./core/windowManager.js";
import { UI_CONFIG } from "./config/ui.config.js";

const desktop = document.getElementById("desktop");
const taskbar = document.getElementById("taskbar");
const startMenu = document.getElementById("startMenu");
const clockPanel = document.getElementById("clockPanel");
const toastRegion = document.getElementById("toastRegion");

function configureViewport() {
  return applyViewportProfile({
    mobileMaxWidth: UI_CONFIG.windows.mobileBreakpoint,
    compactMaxWidth: UI_CONFIG.windows.compactBreakpoint
  });
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), UI_CONFIG.toast.durationMs);
}

function tryOpenRouteApp({ updateRoute = false } = {}) {
  const routeSlug = getRouteSlugFromLocation();
  if (!routeSlug) {
    closeAllWindows({ updateRoute: false });
    return;
  }

  const routedApp = getAppBySlug(routeSlug);
  if (!routedApp) {
    showToast(`Unknown app route: /game/${routeSlug}/`);
    window.history.replaceState({}, "", "/game/");
    closeAllWindows({ updateRoute: false });
    return;
  }

  const access = getAppAccess(routedApp, desktopState.playerProfile);
  if (!access.canOpen) {
    showToast(`${routedApp.shortName} is locked. ${access.reason}.`);
    window.history.replaceState({}, "", "/game/");
    closeAllWindows({ updateRoute: false });
    return;
  }

  openAppWindow(routedApp, { updateRoute });
}

async function bootDesktop(user) {
  configureViewport();
  setUser(user);
  setPlayerProfile(mergePlayerProfile());
  renderDesktop(desktop, { showToast });
  initWindowManager({ desktop, onWindowsChanged: refreshTaskbarWindows, showToast });
  initTaskbar({ taskbar, startMenu, clockPanel, showToast });

  try {
    const profile = await ensurePlayerGameProfile(user);
    setPlayerProfile(profile);
    renderDesktop(desktop, { showToast });
    refreshTaskbarWindows();
  } catch (error) {
    console.warn("Firebase player datastore sync failed", error);
    showToast("Firebase profile sync is offline. Local desktop still booted.");
  }

  tryOpenRouteApp({ updateRoute: false });
}

window.addEventListener("resize", () => {
  configureViewport();
  refreshTaskbarWindows();
}, { passive: true });

window.addEventListener("popstate", () => tryOpenRouteApp({ updateRoute: false }));

configureViewport();
onAuthStateChanged(auth, (user) => {
  if (!user) {
    goToLogin();
    return;
  }

  bootDesktop(user);
});
