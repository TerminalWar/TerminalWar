import { createElement, createIcon } from "../../shared/dom.js";
import { getAppAccess } from "./appAccess.js";
import { getDesktopApps } from "./appLoader.js";
import { desktopState } from "./state.js";
import { openAppWindow } from "./windowManager.js";
import { GAME_CONFIG } from "../config/game.config.js";
import { UI_CONFIG } from "../config/ui.config.js";

function buildWallpaperStyle() {
  const glows = GAME_CONFIG.wallpaper.glowPoints
    .map((point) => `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color}, transparent 28%)`)
    .join(", ");

  return `${glows}, linear-gradient(135deg, rgba(4, 10, 24, 0.92), rgba(18, 5, 35, 0.88)), repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px ${GAME_CONFIG.wallpaper.gridSize}px), repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px ${GAME_CONFIG.wallpaper.gridSize}px)`;
}

function createLoreCard() {
  return createElement("section", { className: "desktop-lore-card" }, [
    createElement("p", { className: "eyebrow", text: `${GAME_CONFIG.osName} // ${GAME_CONFIG.sectorName}` }),
    createElement("h1", { text: GAME_CONFIG.title }),
    createElement("p", { text: GAME_CONFIG.bootMessage })
  ]);
}

function createShortcut(app, notify) {
  const access = getAppAccess(app, desktopState.playerProfile);
  const button = createElement("button", {
    type: "button",
    className: `desktop-shortcut ${access.canOpen ? "" : "is-locked"}`.trim(),
    title: access.canOpen ? app.name : `${app.name} — ${access.reason}`,
    attributes: { "aria-disabled": access.canOpen ? "false" : "true" }
  }, [createIcon(app.icon), createElement("span", { text: app.name })]);

  if (!access.canOpen) button.append(createElement("small", { text: "Locked" }));
  button.addEventListener("click", () => {
    document.querySelectorAll(".desktop-shortcut.is-selected").forEach((el) => el.classList.remove("is-selected"));
    button.classList.add("is-selected");
    if (!access.canOpen) {
      notify?.(`${app.shortName} is locked. ${access.reason}.`);
      return;
    }
    openAppWindow(app);
  });
  return button;
}

export function renderDesktop(desktopEl, { showToast } = {}) {
  desktopEl.style.backgroundImage = buildWallpaperStyle();
  const shortcutArea = createElement("section", {
    className: "desktop-shortcuts",
    ariaLabel: UI_CONFIG.desktop.shortcutsTitle,
    style: {
      "--shortcut-mobile-columns": UI_CONFIG.desktop.mobileColumns,
      "--shortcut-compact-columns": UI_CONFIG.desktop.compactColumns
    }
  });
  for (const app of getDesktopApps()) shortcutArea.append(createShortcut(app, showToast));

  desktopEl.replaceChildren(
    createElement("div", { className: "desktop-overlay", attributes: { "aria-hidden": "true" } }),
    createLoreCard(),
    shortcutArea
  );
}
