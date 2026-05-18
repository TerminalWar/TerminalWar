export const desktopState = {
  user: null,
  playerProfile: null,
  openWindows: new Map(),
  activeWindowId: null,
  zIndexSeed: 50,
  routeAppSlug: null
};

export function setUser(user) {
  desktopState.user = user;
}

export function setPlayerProfile(profile) {
  desktopState.playerProfile = profile;
}

export function getOperatorName(fallbackName) {
  const user = desktopState.user;
  return user?.displayName || user?.email || fallbackName;
}

export function nextZIndex() {
  desktopState.zIndexSeed += 1;
  return desktopState.zIndexSeed;
}
