import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { goToLogin } from "../shared/navigation.js";
import { getAppBySlug, getRouteSlugFromLocation } from "./core/appLoader.js";
import { renderDesktop } from "./core/desktop.js";
import { setUser } from "./core/state.js";
import { initTaskbar, refreshTaskbarWindows } from "./core/taskbar.js";
import { initWindowManager, openAppWindow } from "./core/windowManager.js";

const desktop = document.getElementById("desktop");
const taskbar = document.getElementById("taskbar");
const startMenu = document.getElementById("startMenu");
const clockPanel = document.getElementById("clockPanel");
const toastRegion = document.getElementById("toastRegion");

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3000);
}

function bootDesktop(user) {
  setUser(user);
  renderDesktop(desktop);
  initWindowManager({ desktop, onWindowsChanged: refreshTaskbarWindows });
  initTaskbar({ taskbar, startMenu, clockPanel });

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

onAuthStateChanged(auth, (user) => {
  if (!user) {
    goToLogin();
    return;
  }

  bootDesktop(user);
});
