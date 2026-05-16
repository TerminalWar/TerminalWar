export const GAME_CONFIG = {
  title: "AACR Blacksite",
  osName: "AACR OS",
  sectorName: "Sector 204",
  loreYear: 2050,
  bootMessage: "American Association of Cyber Retaliation blacksite terminal recovered from the fallout. This desktop was built to monetize intrusion, weaponize intelligence, and keep the final war profitable.",
  wallpaper: {
    gridSize: 72,
    glowPoints: [
      { x: 12, y: 16, color: "rgba(27, 255, 225, 0.22)" },
      { x: 72, y: 24, color: "rgba(255, 49, 90, 0.20)" },
      { x: 54, y: 82, color: "rgba(255, 183, 3, 0.12)" },
      { x: 88, y: 70, color: "rgba(108, 92, 231, 0.16)" }
    ]
  },
  session: {
    fallbackOperator: "Wasteland Operator",
    logoutRedirectQuery: "?loggedOut=1"
  }
};
