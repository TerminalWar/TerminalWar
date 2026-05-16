export function getAppStatus(appConfig) {
  const unlock = appConfig.unlock || {};
  const locked = Number(unlock.rankRequired || 0) > 0 || Boolean(unlock.storyFlagRequired);

  return {
    locked,
    label: locked ? "Future unlock" : "Installed",
    details: locked
      ? `Requires rank ${unlock.rankRequired || 0}${unlock.storyFlagRequired ? ` and story flag ${unlock.storyFlagRequired}` : ""}.`
      : "Ready to open as a placeholder window."
  };
}
