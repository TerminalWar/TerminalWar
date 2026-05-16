export const APP_TEMPLATE_CONFIG = {
  window: {
    width: 760,
    height: 500,
    resizable: true,
    maximizable: true
  },
  routing: {
    basePath: "/game/",
    routePattern: "/game/{appSlug}/"
  },
  placeholder: {
    status: "placeholder",
    message: "This app is installed, but its mission systems are not coded yet.",
    configurableFields: [
      "id",
      "slug",
      "name",
      "icon",
      "desktopShortcut",
      "taskbarPinned",
      "window.width",
      "window.height",
      "permissions",
      "economy",
      "unlock"
    ]
  },
  economy: {
    startingCost: 0,
    rewardMultiplier: 1,
    riskMultiplier: 1
  },
  unlock: {
    rankRequired: 0,
    storyFlagRequired: null
  }
};

export const APP_CONFIGS = [
  {
    id: "files",
    slug: "files",
    name: "Files",
    shortName: "Files",
    icon: "/game/apps/files/icon.svg",
    accent: "#4cc9f0",
    desktopShortcut: true,
    taskbarPinned: true,
    description: "Recovered folders, contracts, and classified wasteland notes.",
    appType: "placeholder",
    window: { width: 720, height: 480 },
    permissions: ["read-local-vault"]
  },
  {
    id: "terminal",
    slug: "terminal",
    name: "Terminal",
    shortName: "Terminal",
    icon: "/game/apps/terminal/icon.svg",
    accent: "#39ff14",
    desktopShortcut: true,
    taskbarPinned: true,
    description: "Command line for future hacking commands like //phish and //confirm.",
    appType: "placeholder",
    window: { width: 820, height: 520 },
    permissions: ["run-commands"]
  },
  {
    id: "shop",
    slug: "shop",
    name: "Cyber Shop",
    shortName: "Shop",
    icon: "/game/apps/shop/icon.svg",
    accent: "#ffb703",
    desktopShortcut: true,
    taskbarPinned: true,
    description: "Black-market upgrades, scripts, and seasonal gear will live here.",
    appType: "placeholder",
    window: { width: 780, height: 500 },
    economy: { startingCost: 25, rewardMultiplier: 1, riskMultiplier: 0.75 }
  },
  {
    id: "settings",
    slug: "settings",
    name: "Settings",
    shortName: "Settings",
    icon: "/game/apps/settings/icon.svg",
    accent: "#b8c0ff",
    desktopShortcut: true,
    taskbarPinned: true,
    description: "Visual, audio, and account options placeholder.",
    appType: "placeholder",
    window: { width: 700, height: 460 }
  },
  {
    id: "casino",
    slug: "casino",
    name: "Digital Casino",
    shortName: "Casino",
    icon: "/game/apps/casino/icon.svg",
    accent: "#ff3d9e",
    desktopShortcut: true,
    taskbarPinned: false,
    description: "High-risk credit games unlocked later in the wasteland economy.",
    appType: "placeholder",
    window: { width: 760, height: 500 },
    unlock: { rankRequired: 3, storyFlagRequired: "casino_contact" }
  },
  {
    id: "profile",
    slug: "profile",
    name: "Profile",
    shortName: "Profile",
    icon: "/game/apps/profile/icon.svg",
    accent: "#7bdff2",
    desktopShortcut: true,
    taskbarPinned: false,
    description: "Hacking rank, money earned, seasonal items, and player stats.",
    appType: "placeholder",
    window: { width: 740, height: 500 }
  },
  {
    id: "battle",
    slug: "battle",
    name: "Battle.app",
    shortName: "Battle",
    icon: "/game/apps/battle/icon.svg",
    accent: "#ef476f",
    desktopShortcut: true,
    taskbarPinned: false,
    description: "Future war map for drone command contracts and target strikes.",
    appType: "placeholder",
    window: { width: 880, height: 560 },
    unlock: { rankRequired: 8, storyFlagRequired: "drone_network" }
  },
  {
    id: "browser",
    slug: "browser",
    name: "Web Browser",
    shortName: "Browser",
    icon: "/game/apps/browser/icon.svg",
    accent: "#00f5d4",
    desktopShortcut: false,
    taskbarPinned: false,
    description: "Locked browser for late-game networks and deep-web contracts.",
    appType: "placeholder",
    window: { width: 860, height: 540 },
    unlock: { rankRequired: 10, storyFlagRequired: "uplink_restored" }
  },
  {
    id: "stocks",
    slug: "stocks",
    name: "Stock Market",
    shortName: "Stocks",
    icon: "/game/apps/stocks/icon.svg",
    accent: "#80ed99",
    desktopShortcut: false,
    taskbarPinned: false,
    description: "Player-to-player market concepts will be prototyped here.",
    appType: "placeholder",
    window: { width: 820, height: 520 },
    unlock: { rankRequired: 5, storyFlagRequired: "market_feed" }
  },
  {
    id: "template",
    slug: "template",
    name: "Template App",
    shortName: "Template",
    icon: "/game/apps/_templateApp/icon.svg",
    accent: "#c77dff",
    desktopShortcut: true,
    taskbarPinned: false,
    description: "Copy this folder/config to create a new app route under /game/Appname/.",
    appType: "template",
    window: { width: 760, height: 500 }
  }
];
