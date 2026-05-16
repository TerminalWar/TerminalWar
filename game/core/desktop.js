import { getDesktopApps } from "./appLoader.js";
import { openAppWindow } from "./windowManager.js";
import { GAME_CONFIG } from "../config/game.config.js";
import { UI_CONFIG } from "../config/ui.config.js";

function buildWallpaperStyle() {
  const glows = GAME_CONFIG.wallpaper.glowPoints
    .map((point) => `radial-gradient(circle at ${point.x}% ${point.y}%, ${point.color}, transparent 28%)`)
    .join(", ");

  return `${glows}, linear-gradient(135deg, rgba(4, 10, 24, 0.92), rgba(18, 5, 35, 0.88)), repeating-linear-gradient(90deg, rgba(255,255,255,.045) 0 1px, transparent 1px ${GAME_CONFIG.wallpaper.gridSize}px), repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px ${GAME_CONFIG.wallpaper.gridSize}px)`;
}

export function renderDesktop(desktopEl) {
  desktopEl.style.backgroundImage = buildWallpaperStyle();
  desktopEl.innerHTML = `
    <div class="desktop-overlay" aria-hidden="true"></div>
    <section class="desktop-lore-card">
      <p class="eyebrow">${GAME_CONFIG.osName} // ${GAME_CONFIG.sectorName}</p>
      <h1>${GAME_CONFIG.title}</h1>
      <p>${GAME_CONFIG.bootMessage}</p>
    </section>
    <section class="desktop-shortcuts" aria-label="${UI_CONFIG.desktop.shortcutsTitle}"></section>
  `;

  const shortcutArea = desktopEl.querySelector(".desktop-shortcuts");
  for (const app of getDesktopApps()) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "desktop-shortcut";
    button.innerHTML = `<img src="${app.icon}" alt="" /><span>${app.name}</span>`;
    button.addEventListener("click", () => {
      document.querySelectorAll(".desktop-shortcut.is-selected").forEach((el) => el.classList.remove("is-selected"));
      button.classList.add("is-selected");
      openAppWindow(app);
    });
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter") openAppWindow(app);
    });
    shortcutArea.append(button);
  }
}
