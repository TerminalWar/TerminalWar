import { createElement, createIcon } from "../../shared/dom.js";
import { savePlayerRoute } from "./playerStore.js";
import { UI_CONFIG } from "../config/ui.config.js";
import { getAppAccess } from "./appAccess.js";
import { createAppContent, routeToApp } from "./appLoader.js";
import { desktopState, nextZIndex } from "./state.js";

let windowSequence = 0;
let desktopElement;
let taskbarRefresh;
let notify = () => {};
const launchedApps = new Set();

export function initWindowManager({ desktop, onWindowsChanged, showToast }) {
  desktopElement = desktop;
  taskbarRefresh = onWindowsChanged;
  notify = showToast || notify;
}

async function saveRouteToDatastore(path) {
  try {
    await savePlayerRoute(desktopState.user, path);
  } catch (error) {
    console.warn("Route datastore sync failed", error);
  }
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
  return Math.min(Math.max(value, min), Math.max(min, max));
}

function getViewportBounds() {
  const gap = UI_CONFIG.windows.minViewportGap;
  return {
    gap,
    width: window.innerWidth,
    height: window.innerHeight,
    usableBottom: window.innerHeight - UI_CONFIG.taskbar.height - gap
  };
}

function isSmallTouchLayout() {
  return window.innerWidth <= UI_CONFIG.windows.mobileBreakpoint;
}

function shouldMobileMaximize() {
  return UI_CONFIG.windows.mobileMaximizedByDefault && isSmallTouchLayout();
}

function makeDraggable(windowEl, handle) {
  let dragState = null;

  handle.addEventListener("pointerdown", (event) => {
    if (isSmallTouchLayout()) return;
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
    const bounds = getViewportBounds();
    const maxLeft = bounds.width - windowEl.offsetWidth - bounds.gap;
    const maxTop = bounds.usableBottom - windowEl.offsetHeight;
    windowEl.style.left = `${constrainPosition(dragState.left + event.clientX - dragState.startX, bounds.gap, maxLeft)}px`;
    windowEl.style.top = `${constrainPosition(dragState.top + event.clientY - dragState.startY, bounds.gap, maxTop)}px`;
  });

  function endDrag(event) {
    dragState = null;
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }

  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
}

function stopWindowControlEvent(event) {
  event.stopPropagation();
}

function syncBaseRouteIfEmpty(updateRoute = true) {
  if (desktopState.openWindows.size === 0 && window.location.pathname !== "/game/") {
    if (updateRoute) window.history.pushState({}, "", "/game/");
    saveRouteToDatastore("/game/");
  }
}


function minimizeWindow(windowId) {
  if (isSmallTouchLayout()) return;
  const record = desktopState.openWindows.get(windowId);
  if (!record) return;
  record.element.hidden = true;
  if (desktopState.activeWindowId === windowId) {
    const nextVisible = Array.from(desktopState.openWindows.values()).find((candidate) => !candidate.element.hidden);
    desktopState.activeWindowId = nextVisible?.id || null;
    if (nextVisible) setActiveWindow(nextVisible.id);
    else record.element.classList.remove("is-active");
  }
  taskbarRefresh?.();
}

function closeWindow(windowId, { updateRoute = true } = {}) {
  const record = desktopState.openWindows.get(windowId);
  if (!record) return;
  record.element.remove();
  desktopState.openWindows.delete(windowId);
  if (desktopState.activeWindowId === windowId) {
    desktopState.activeWindowId = desktopState.openWindows.keys().next().value || null;
  }
  syncBaseRouteIfEmpty(updateRoute);
  taskbarRefresh?.();
}

export function closeAllWindows({ updateRoute = true } = {}) {
  for (const record of desktopState.openWindows.values()) record.element.remove();
  desktopState.openWindows.clear();
  desktopState.activeWindowId = null;
  syncBaseRouteIfEmpty(updateRoute);
  taskbarRefresh?.();
}

function toggleMaximize(windowEl) {
  windowEl.classList.toggle("is-maximized");
  setActiveWindow(windowEl.dataset.windowId);
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function createWindowShell(appConfig, windowId, width, height, offset) {
  const bounds = getViewportBounds();
  const windowEl = createElement("article", {
    className: "app-window",
    dataset: { windowId },
    style: {
      "--app-accent": appConfig.accent,
      width: `${Math.min(width, bounds.width - bounds.gap * 2)}px`,
      height: `${Math.min(height, bounds.usableBottom - bounds.gap)}px`,
      left: `${constrainPosition(86 + offset, bounds.gap, bounds.width - Math.min(width, bounds.width - bounds.gap * 2) - bounds.gap)}px`,
      top: `${constrainPosition(54 + offset, bounds.gap, bounds.usableBottom - Math.min(height, bounds.usableBottom - bounds.gap))}px`
    }
  });

  const loader = createElement("div", { className: "app-launch-loader", attributes: { "aria-hidden": "true" } }, [
    createElement("div", { className: "loader-core" }, [createElement("span"), createElement("span"), createElement("span")]),
    createElement("strong", { text: `AACR loading ${appConfig.shortName}` }),
    createElement("small", { text: "decrypting app shell // syncing blacksite permissions" })
  ]);
  const titlebar = createElement("header", { className: "window-titlebar" });
  const title = createElement("div", { className: "window-title" }, [createIcon(appConfig.icon), createElement("span", { text: appConfig.name })]);
  const controls = createElement("div", { className: "window-controls" }, [
    createElement("button", { type: "button", text: "−", attributes: { "data-action": "minimize" }, ariaLabel: `Minimize ${appConfig.name}` }),
    createElement("button", { type: "button", text: "□", attributes: { "data-action": "maximize" }, ariaLabel: `Maximize ${appConfig.name}` }),
    createElement("button", { type: "button", text: "×", attributes: { "data-action": "close" }, ariaLabel: `Close ${appConfig.name}` })
  ]);
  const content = createElement("div", { className: "window-content" }, [createElement("div", { className: "loading-stripe", text: "Loading app shell…" })]);

  titlebar.append(title, controls);
  windowEl.append(loader, titlebar, content);
  if (shouldMobileMaximize()) windowEl.classList.add("is-maximized");
  return { windowEl, titlebar, controls, content };
}

export async function openAppWindow(appConfig, { updateRoute = true } = {}) {
  const access = getAppAccess(appConfig, desktopState.playerProfile);
  if (!access.canOpen) {
    notify(`${appConfig.shortName} is locked. ${access.reason}.`);
    return null;
  }

  const existing = Array.from(desktopState.openWindows.values()).find((record) => record.app.id === appConfig.id);
  if (existing) {
    existing.element.hidden = false;
    setActiveWindow(existing.id);
    if (updateRoute) {
      routeToApp(appConfig);
      saveRouteToDatastore(`/game/${appConfig.slug}/`);
    }
    return existing;
  }

  const windowId = `window-${++windowSequence}`;
  const width = appConfig.window?.width || UI_CONFIG.windows.defaultSize.width;
  const height = appConfig.window?.height || UI_CONFIG.windows.defaultSize.height;
  const offset = (windowSequence - 1) * UI_CONFIG.windows.cascadeOffset;
  const { windowEl, titlebar, controls, content } = createWindowShell(appConfig, windowId, width, height, offset);

  makeDraggable(windowEl, titlebar);
  windowEl.addEventListener("pointerdown", () => setActiveWindow(windowId));
  controls.addEventListener("pointerdown", stopWindowControlEvent);
  controls.addEventListener("click", stopWindowControlEvent);
  windowEl.querySelector('[data-action="close"]').addEventListener("click", (event) => {
    stopWindowControlEvent(event);
    closeWindow(windowId);
  });
  windowEl.querySelector('[data-action="minimize"]').addEventListener("click", (event) => {
    stopWindowControlEvent(event);
    minimizeWindow(windowId);
  });
  windowEl.querySelector('[data-action="maximize"]').addEventListener("click", (event) => {
    stopWindowControlEvent(event);
    toggleMaximize(windowEl);
  });

  desktopElement.append(windowEl);
  desktopState.openWindows.set(windowId, { id: windowId, app: appConfig, element: windowEl });
  setActiveWindow(windowId);

  try {
    const launchDelay = launchedApps.has(appConfig.id) ? UI_CONFIG.windows.repeatLaunchDelayMs : UI_CONFIG.windows.launchDelayMs;
    await sleep(launchDelay);
    launchedApps.add(appConfig.id);
    if (!desktopState.openWindows.has(windowId)) return null;
    windowEl.querySelector(".app-launch-loader")?.classList.add("is-complete");
    content.replaceChildren(await createAppContent(appConfig));
  } catch (error) {
    console.error(`Failed to load ${appConfig.id}`, error);
    content.replaceChildren(createElement("div", { className: "app-error", text: "App failed to load. Check console for details." }));
  }

  if (updateRoute) {
    routeToApp(appConfig);
    saveRouteToDatastore(`/game/${appConfig.slug}/`);
  }
  taskbarRefresh?.();
  return desktopState.openWindows.get(windowId);
}

export function restoreWindow(windowId) {
  const record = desktopState.openWindows.get(windowId);
  if (!record) return;
  record.element.hidden = false;
  setActiveWindow(windowId);
  routeToApp(record.app);
  saveRouteToDatastore(`/game/${record.app.slug}/`);
}

export function getOpenWindowRecords() {
  return Array.from(desktopState.openWindows.values());
}
