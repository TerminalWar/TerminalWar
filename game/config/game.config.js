export const GAME_CONFIG = {
  title: "Terminal War 2050",
  osName: "Wasteland OS",
  sectorName: "Sector 204",
  loreYear: 2050,
  bootMessage: "Government recovery terminal unlocked after wasteland scavenging.",
  wallpaper: {
    gridSize: 72,
    glowPoints: [
      { x: 14, y: 18, color: "rgba(0, 245, 255, 0.35)" },
      { x: 76, y: 26, color: "rgba(255, 61, 158, 0.28)" },
      { x: 58, y: 78, color: "rgba(125, 255, 61, 0.18)" }
    ]
  },
  session: {
    fallbackOperator: "Wasteland Operator",
    logoutRedirectQuery: "?loggedOut=1"
  }
};
