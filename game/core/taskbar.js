import { signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { createElement, createIcon } from "../../shared/dom.js";
import { GAME_CONFIG } from "../config/game.config.js";
import { UI_CONFIG } from "../config/ui.config.js";
import { auth } from "../../shared/firebase.js";
import { goToLogin } from "../../shared/navigation.js";
import { getAppAccess } from "./appAccess.js";
import { getApps, getPinnedApps } from "./appLoader.js";
import { desktopState, getOperatorName } from "./state.js";
import { getOpenWindowRecords, openAppWindow, restoreWindow } from "./windowManager.js";

let refs;
let notify = () => {};

function formatFutureDate(date) {
  return new Intl.DateTimeFormat(UI_CONFIG.clock.locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(UI_CONFIG.clock.futureYear, date.getMonth(), date.getDate()));
}

function formatFutureTime(date) {
  return new Intl.DateTimeFormat(UI_CONFIG.clock.locale, {
    hour: "numeric",
    minute: "2-digit",
    hour12: UI_CONFIG.clock.hour12
  }).format(date);
}

function togglePanel(panel, force) {
  const shouldOpen = typeof force === "boolean" ? force : panel.hidden;
  refs.startMenu.hidden = true;
  refs.clockPanel.hidden = true;
  panel.hidden = !shouldOpen;
}

function buildAppButton(app, className) {
  const access = getAppAccess(app, desktopState.playerProfile);
  const button = createElement("button", {
    type: "button",
    className: `${className} ${access.canOpen ? "" : "is-locked"}`.trim(),
    title: access.canOpen ? app.name : `${app.name} — ${access.reason}`,
    attributes: { "aria-disabled": access.canOpen ? "false" : "true" }
  });

  button.append(createIcon(app.icon), createElement("span", { text: app.shortName }));
  if (!access.canOpen) button.append(createElement("small", { text: access.reason }));
  button.addEventListener("click", () => {
    if (!access.canOpen) {
      notify(`${app.shortName} is locked. ${access.reason}.`);
      return;
    }
    togglePanel(refs.startMenu, false);
    openAppWindow(app);
  });
  return button;
}

function renderStartMenu() {
  refs.startMenu.replaceChildren();
  const header = createElement("div", { className: "start-header" }, [
    createElement("div", {}, [
      createElement("p", { className: "eyebrow", text: "Installed apps" }),
      createElement("h2", { text: GAME_CONFIG.osName })
    ]),
    createElement("span", { text: String(GAME_CONFIG.loreYear) })
  ]);
  const grid = createElement("div", { className: "start-grid" });
  for (const app of getApps()) grid.append(buildAppButton(app, "start-app"));
  refs.startMenu.append(header, grid);
}

function renderClockPanel(now = new Date()) {
  refs.clockPanel.replaceChildren();
  const clockCard = createElement("div", { className: "clock-card" }, [
    createElement("p", { className: "eyebrow", text: "System date" }),
    createElement("strong", { text: `${formatFutureTime(now)} ${UI_CONFIG.clock.futureYear}` }),
    createElement("span", { text: formatFutureDate(now) })
  ]);
  const operatorCard = createElement("div", { className: "operator-card" }, [
    createElement("span", { text: "Logged in as" }),
    createElement("strong", { text: getOperatorName(GAME_CONFIG.session.fallbackOperator) })
  ]);
  const logoutButton = createElement("button", { type: "button", className: "logout-button", text: "Logout" });

  logoutButton.addEventListener("click", async () => {
    logoutButton.disabled = true;
    logoutButton.textContent = "Logging out…";
    try {
      await signOut(auth);
      goToLogin(GAME_CONFIG.session.logoutRedirectQuery);
    } catch (error) {
      console.error("Logout failed", error);
      logoutButton.disabled = false;
      logoutButton.textContent = "Logout failed — retry";
    }
  });

  refs.clockPanel.append(clockCard, operatorCard, logoutButton);
}

function tickClock() {
  const now = new Date();
  refs.clockButton.replaceChildren(
    createElement("span", { text: formatFutureTime(now) }),
    createElement("small", { text: String(UI_CONFIG.clock.futureYear) })
  );
  if (!refs.clockPanel.hidden) renderClockPanel(now);
}

function renderPinnedApps() {
  refs.pinnedApps.replaceChildren();
  for (const app of getPinnedApps(UI_CONFIG.taskbar.pinnedAppIds)) {
    const access = getAppAccess(app, desktopState.playerProfile);
    const button = createElement("button", {
      type: "button",
      className: `pinned-app ${access.canOpen ? "" : "is-locked"}`.trim(),
      title: access.canOpen ? app.name : `${app.name} — ${access.reason}`,
      attributes: { "aria-disabled": access.canOpen ? "false" : "true" }
    }, [createIcon(app.icon)]);
    button.addEventListener("click", () => {
      if (!access.canOpen) {
        notify(`${app.shortName} is locked. ${access.reason}.`);
        return;
      }
      openAppWindow(app);
    });
    refs.pinnedApps.append(button);
  }
}

export function refreshTaskbarWindows() {
  if (!refs) return;
  refs.windowStrip.replaceChildren();
  const openRecords = getOpenWindowRecords();
  refs.mobileWindowButton.textContent = `Apps ${openRecords.length}`;
  for (const record of openRecords) {
    const button = createElement("button", {
      type: "button",
      className: `taskbar-window ${record.element.hidden ? "is-minimized" : ""}`.trim()
    }, [createIcon(record.app.icon), createElement("span", { text: record.app.shortName })]);
    button.addEventListener("click", () => restoreWindow(record.id));
    refs.windowStrip.append(button);
  }
  renderPinnedApps();
  renderStartMenu();
}

export function initTaskbar({ taskbar, startMenu, clockPanel, showToast }) {
  notify = showToast || notify;
  taskbar.replaceChildren(
    createElement("button", { type: "button", className: "app-launcher-button", text: UI_CONFIG.taskbar.appButtonLabel, ariaLabel: UI_CONFIG.taskbar.appButtonTitle }),
    createElement("div", { className: "pinned-apps", attributes: { "aria-label": "Pinned apps" } }),
    createElement("div", { className: "taskbar-window-strip", attributes: { "aria-label": "Open windows" } }),
    createElement("button", { type: "button", className: "mobile-window-button", text: "Apps 0", ariaLabel: "Open window list" }),
    createElement("button", { type: "button", className: "clock-button", ariaLabel: "Open time, calendar, and logout panel" })
  );

  refs = {
    taskbar,
    startMenu,
    clockPanel,
    launcher: taskbar.querySelector(".app-launcher-button"),
    pinnedApps: taskbar.querySelector(".pinned-apps"),
    windowStrip: taskbar.querySelector(".taskbar-window-strip"),
    clockButton: taskbar.querySelector(".clock-button"),
    mobileWindowButton: taskbar.querySelector(".mobile-window-button")
  };

  refs.launcher.addEventListener("click", () => togglePanel(refs.startMenu));
  refs.mobileWindowButton.addEventListener("click", () => togglePanel(refs.startMenu, true));
  refs.clockButton.addEventListener("click", () => {
    renderClockPanel();
    togglePanel(refs.clockPanel);
  });

  renderPinnedApps();

  document.addEventListener("click", (event) => {
    if (!refs.startMenu.hidden && !refs.startMenu.contains(event.target) && !refs.launcher.contains(event.target)) {
      refs.startMenu.hidden = true;
    }
    if (!refs.clockPanel.hidden && !refs.clockPanel.contains(event.target) && !refs.clockButton.contains(event.target)) {
      refs.clockPanel.hidden = true;
    }
  });

  renderStartMenu();
  tickClock();
  window.setInterval(tickClock, 1000);
}
