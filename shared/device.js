export function getViewportProfile({ mobileMaxWidth = 720, compactMaxWidth = 980 } = {}) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const coarsePointer = window.matchMedia?.("(pointer: coarse)").matches || false;
  const touchPoints = navigator.maxTouchPoints || 0;
  const deviceMemory = navigator.deviceMemory || 8;
  const cpuCores = navigator.hardwareConcurrency || 8;
  const isSmallScreen = Math.min(width, height) <= mobileMaxWidth;
  const mode = width <= mobileMaxWidth ? "mobile" : width <= compactMaxWidth ? "compact" : "desktop";

  return {
    width,
    height,
    mode,
    coarsePointer,
    touchPoints,
    isTouch: coarsePointer || touchPoints > 0,
    isSmallScreen,
    performance: deviceMemory <= 4 || cpuCores <= 4 ? "low" : "high"
  };
}

export function applyViewportProfile(options = {}) {
  const profile = getViewportProfile(options);
  document.documentElement.dataset.device = profile.mode;
  document.documentElement.dataset.performance = profile.performance;
  document.body.dataset.device = profile.mode;
  document.body.dataset.performance = profile.performance;
  document.documentElement.style.setProperty("--app-vh", `${profile.height * 0.01}px`);
  return profile;
}
