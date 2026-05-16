import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { goToLogin } from "../shared/navigation.js";
import { getAppBySlug, getRouteSlugFromLocation } from "./core/appLoader.js";
import { renderDesktop } from "./core/desktop.js";
import { ensurePlayerGameProfile } from "./core/playerStore.js";
import { setUser } from "./core/state.js";
import { initTaskbar, refreshTaskbarWindows } from "./core/taskbar.js";
import { initWindowManager, openAppWindow } from "./core/windowManager.js";

const desktop = document.getElementById("desktop");
const taskbar = document.getElementById("taskbar");
const startMenu = document.getElementById("startMenu");
const clockPanel = document.getElementById("clockPanel");
const toastRegion = document.getElementById("toastRegion");
const mobileBlocker = document.getElementById("mobileBlocker");

function isMobileDevice() {
  const ua = navigator.userAgent || "";
  const phoneOrTabletUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const touchSmallScreen = (navigator.maxTouchPoints || 0) > 1 && Math.min(window.innerWidth, window.innerHeight) <= 900;
  return phoneOrTabletUA || touchSmallScreen;
}

function lockMobilePlayers() {
  if (!isMobileDevice()) return false;
  document.documentElement.dataset.device = "mobile-blocked";
  document.body.dataset.device = "mobile-blocked";
  if (mobileBlocker) mobileBlocker.hidden = false;
  return true;
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function bootDesktop(user) {
  if (lockMobilePlayers()) return;
  setUser(user);
  renderDesktop(desktop);
  initWindowManager({ desktop, onWindowsChanged: refreshTaskbarWindows });
  initTaskbar({ taskbar, startMenu, clockPanel });
  ensurePlayerGameProfile(user).catch((error) => {
    console.warn("Firebase player datastore sync failed", error);
    showToast("Firebase profile sync is offline. Local desktop still booted.");
  });

  const routeSlug = getRouteSlugFromLocation();
  if (routeSlug) {
    const routedApp = getAppBySlug(routeSlug);
    if (routedApp) {
      openAppWindow(routedApp, { updateRoute: false });
    } else {
      showToast(`Unknown app route: /game/${routeSlug}/`);
      window.history.replaceState({}, "", "/game/");
    }
  }
}

window.addEventListener("popstate", () => {
  const slug = getRouteSlugFromLocation();
  const app = getAppBySlug(slug);
  if (app) openAppWindow(app, { updateRoute: false });
});

if (lockMobilePlayers()) {
  // The game is intentionally a laptop/PC desktop experience.
} else onAuthStateChanged(auth, (user) => {
  if (!user) {
    goToLogin();
    return;
  }

  bootDesktop(user);
});
