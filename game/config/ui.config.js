export const UI_CONFIG = {
  taskbar: {
    height: 64,
    appButtonLabel: "AACR",
    appButtonTitle: "Open installed apps",
    pinnedAppIds: ["files", "terminal", "shop", "settings"]
  },
  windows: {
    defaultSize: { width: 760, height: 500 },
    minSize: { width: 330, height: 240 },
    cascadeOffset: 28,
    launchDelayMs: 900,
    repeatLaunchDelayMs: 180,
    mobileBreakpoint: 720,
    compactBreakpoint: 980,
    minViewportGap: 8,
    mobileMaximizedByDefault: true
  },
  clock: {
    futureYear: 2050,
    locale: "en-US",
    hour12: false
  },
  desktop: {
    shortcutsTitle: "Desktop shortcuts",
    emptyHint: "Tap an app, double-click it, or open the taskbar app grid.",
    mobileColumns: 4,
    compactColumns: 5
  },
  toast: {
    durationMs: 3000
  },
  login: {
    firstHandoffDelayMs: 6500,
    returningHandoffDelayMs: 1200,
    seenHandoffStorageKey: "terminalWar.seenLoginHandoff"
  }
};
