import { signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { GAME_CONFIG } from "../config/game.config.js";
import { UI_CONFIG } from "../config/ui.config.js";
import { auth } from "../../shared/firebase.js";
import { goToLogin } from "../../shared/navigation.js";
import { getApps, getPinnedApps } from "./appLoader.js";
import { getOperatorName } from "./state.js";
import { getOpenWindowRecords, openAppWindow, restoreWindow } from "./windowManager.js";

let refs;

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

function renderStartMenu() {
  refs.startMenu.innerHTML = `
    <div class="start-header">
      <div>
        <p class="eyebrow">Installed apps</p>
        <h2>${GAME_CONFIG.osName}</h2>
      </div>
      <span>${GAME_CONFIG.loreYear}</span>
    </div>
    <div class="start-grid"></div>
  `;

  const grid = refs.startMenu.querySelector(".start-grid");
  for (const app of getApps()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "start-app";
    button.innerHTML = `
      <img src="${app.icon}" alt="" />
      <span>${app.shortName}</span>
      ${app.unlock?.rankRequired ? `<small>Rank ${app.unlock.rankRequired}</small>` : ""}
    `;
    button.addEventListener("click", () => {
      togglePanel(refs.startMenu, false);
      openAppWindow(app);
    });
    grid.append(button);
  }
}

function renderClockPanel(now = new Date()) {
  refs.clockPanel.innerHTML = `
    <div class="clock-card">
      <p class="eyebrow">System date</p>
      <strong>${formatFutureTime(now)} ${UI_CONFIG.clock.futureYear}</strong>
      <span>${formatFutureDate(now)}</span>
    </div>
    <div class="operator-card">
      <span>Logged in as</span>
      <strong>${getOperatorName(GAME_CONFIG.session.fallbackOperator)}</strong>
    </div>
    <button id="logoutBtn" class="logout-button" type="button">Logout</button>
  `;

  refs.clockPanel.querySelector("#logoutBtn").addEventListener("click", async () => {
    const button = refs.clockPanel.querySelector("#logoutBtn");
    button.disabled = true;
    button.textContent = "Logging out…";
    try {
      await signOut(auth);
      goToLogin(GAME_CONFIG.session.logoutRedirectQuery);
    } catch (error) {
      console.error("Logout failed", error);
      button.disabled = false;
      button.textContent = "Logout failed — retry";
    }
  });
}

function tickClock() {
  const now = new Date();
  refs.clockButton.innerHTML = `<span>${formatFutureTime(now)}</span><small>${UI_CONFIG.clock.futureYear}</small>`;
  if (!refs.clockPanel.hidden) renderClockPanel(now);
}

export function refreshTaskbarWindows() {
  refs.windowStrip.innerHTML = "";
  for (const record of getOpenWindowRecords()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `taskbar-window ${record.element.hidden ? "is-minimized" : ""}`;
    button.innerHTML = `<img src="${record.app.icon}" alt="" /><span>${record.app.shortName}</span>`;
    button.addEventListener("click", () => restoreWindow(record.id));
    refs.windowStrip.append(button);
  }
}

export function initTaskbar({ taskbar, startMenu, clockPanel }) {
  taskbar.innerHTML = `
    <button class="app-launcher-button" type="button" aria-label="${UI_CONFIG.taskbar.appButtonTitle}">${UI_CONFIG.taskbar.appButtonLabel}</button>
    <div class="pinned-apps" aria-label="Pinned apps"></div>
    <div class="taskbar-window-strip" aria-label="Open windows"></div>
    <button class="clock-button" type="button" aria-label="Open time, calendar, and logout panel"></button>
  `;

  refs = {
    taskbar,
    startMenu,
    clockPanel,
    launcher: taskbar.querySelector(".app-launcher-button"),
    pinnedApps: taskbar.querySelector(".pinned-apps"),
    windowStrip: taskbar.querySelector(".taskbar-window-strip"),
    clockButton: taskbar.querySelector(".clock-button")
  };

  refs.launcher.addEventListener("click", () => togglePanel(refs.startMenu));
  refs.clockButton.addEventListener("click", () => {
    renderClockPanel();
    togglePanel(refs.clockPanel);
  });

  for (const app of getPinnedApps(UI_CONFIG.taskbar.pinnedAppIds)) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "pinned-app";
    button.title = app.name;
    button.innerHTML = `<img src="${app.icon}" alt="" />`;
    button.addEventListener("click", () => openAppWindow(app));
    refs.pinnedApps.append(button);
  }

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
