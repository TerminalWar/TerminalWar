import { UI_CONFIG } from "../config/ui.config.js";
import { createAppContent, routeToApp } from "./appLoader.js";
import { desktopState, nextZIndex } from "./state.js";

let windowSequence = 0;
let desktopElement;
let taskbarRefresh;

export function initWindowManager({ desktop, onWindowsChanged }) {
  desktopElement = desktop;
  taskbarRefresh = onWindowsChanged;
}

function setActiveWindow(windowId) {
  desktopState.activeWindowId = windowId;
  for (const [id, record] of desktopState.openWindows) {
    record.element.classList.toggle("is-active", id === windowId);
  }
  const active = desktopState.openWindows.get(windowId);
  if (active) active.element.style.zIndex = nextZIndex();
  taskbarRefresh?.();
}

function constrainPosition(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function makeDraggable(windowEl, handle) {
  let dragState = null;

  handle.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || windowEl.classList.contains("is-maximized")) return;
    setActiveWindow(windowEl.dataset.windowId);
    const rect = windowEl.getBoundingClientRect();
    dragState = {
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top
    };
    handle.setPointerCapture(event.pointerId);
  });

  handle.addEventListener("pointermove", (event) => {
    if (!dragState) return;
    const maxLeft = window.innerWidth - windowEl.offsetWidth;
    const maxTop = window.innerHeight - UI_CONFIG.taskbar.height - 80;
    windowEl.style.left = `${constrainPosition(dragState.left + event.clientX - dragState.startX, 8, maxLeft)}px`;
    windowEl.style.top = `${constrainPosition(dragState.top + event.clientY - dragState.startY, 8, maxTop)}px`;
  });

  handle.addEventListener("pointerup", (event) => {
    dragState = null;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  });
}

function closeWindow(windowId) {
  const record = desktopState.openWindows.get(windowId);
  if (!record) return;
  record.element.remove();
  desktopState.openWindows.delete(windowId);
  if (desktopState.activeWindowId === windowId) {
    desktopState.activeWindowId = desktopState.openWindows.keys().next().value || null;
  }
  if (desktopState.openWindows.size === 0 && window.location.pathname !== "/game/") {
    window.history.pushState({}, "", "/game/");
  }
  taskbarRefresh?.();
}

function toggleMaximize(windowEl) {
  windowEl.classList.toggle("is-maximized");
  setActiveWindow(windowEl.dataset.windowId);
}

export async function openAppWindow(appConfig, { updateRoute = true } = {}) {
  const existing = Array.from(desktopState.openWindows.values()).find((record) => record.app.id === appConfig.id);
  if (existing) {
    existing.element.hidden = false;
    setActiveWindow(existing.id);
    if (updateRoute) routeToApp(appConfig);
    return existing;
  }

  const windowId = `window-${++windowSequence}`;
  const width = appConfig.window?.width || UI_CONFIG.windows.defaultSize.width;
  const height = appConfig.window?.height || UI_CONFIG.windows.defaultSize.height;
  const offset = (windowSequence - 1) * UI_CONFIG.windows.cascadeOffset;

  const windowEl = document.createElement("article");
  windowEl.className = "app-window";
  windowEl.dataset.windowId = windowId;
  windowEl.style.width = `${width}px`;
  windowEl.style.height = `${height}px`;
  windowEl.style.left = `${Math.min(86 + offset, window.innerWidth - 360)}px`;
  windowEl.style.top = `${Math.min(54 + offset, window.innerHeight - 340)}px`;
  windowEl.style.setProperty("--app-accent", appConfig.accent);
  windowEl.innerHTML = `
    <header class="window-titlebar">
      <div class="window-title">
        <img src="${appConfig.icon}" alt="" />
        <span>${appConfig.name}</span>
      </div>
      <div class="window-controls">
        <button type="button" data-action="minimize" aria-label="Minimize ${appConfig.name}">−</button>
        <button type="button" data-action="maximize" aria-label="Maximize ${appConfig.name}">□</button>
        <button type="button" data-action="close" aria-label="Close ${appConfig.name}">×</button>
      </div>
    </header>
    <div class="window-content"><div class="loading-stripe">Loading app shell…</div></div>
  `;

  const titlebar = windowEl.querySelector(".window-titlebar");
  const content = windowEl.querySelector(".window-content");
  makeDraggable(windowEl, titlebar);

  windowEl.addEventListener("pointerdown", () => setActiveWindow(windowId));
  windowEl.querySelector('[data-action="close"]').addEventListener("click", () => closeWindow(windowId));
  windowEl.querySelector('[data-action="minimize"]').addEventListener("click", () => {
    windowEl.hidden = true;
    taskbarRefresh?.();
  });
  windowEl.querySelector('[data-action="maximize"]').addEventListener("click", () => toggleMaximize(windowEl));

  desktopElement.append(windowEl);
  desktopState.openWindows.set(windowId, { id: windowId, app: appConfig, element: windowEl });
  setActiveWindow(windowId);

  try {
    content.replaceChildren(await createAppContent(appConfig));
  } catch (error) {
    console.error(`Failed to load ${appConfig.id}`, error);
    content.innerHTML = `<div class="app-error">App failed to load. Check console for details.</div>`;
  }

  if (updateRoute) routeToApp(appConfig);
  taskbarRefresh?.();
  return desktopState.openWindows.get(windowId);
}

export function restoreWindow(windowId) {
  const record = desktopState.openWindows.get(windowId);
  if (!record) return;
  record.element.hidden = false;
  setActiveWindow(windowId);
  routeToApp(record.app);
}

export function getOpenWindowRecords() {
  return Array.from(desktopState.openWindows.values());
}
