export function getAppAccess(appConfig, playerProfile) {
  const unlock = appConfig.unlock || {};
  const progression = playerProfile?.progression || {};
  const rank = Number(progression.hackingRank || 0);
  const storyFlags = new Set(progression.storyFlags || []);
  const requiredRank = Number(unlock.rankRequired || 0);
  const requiredFlag = unlock.storyFlagRequired || null;
  const missingRank = requiredRank > rank;
  const missingFlag = Boolean(requiredFlag && !storyFlags.has(requiredFlag));

  if (!missingRank && !missingFlag) {
    return { canOpen: true, label: "Installed", reason: "Ready" };
  }

  const requirements = [];
  if (missingRank) requirements.push(`Rank ${requiredRank}`);
  if (missingFlag) requirements.push(`Story flag: ${requiredFlag}`);

  return {
    canOpen: false,
    label: "Locked",
    reason: `Requires ${requirements.join(" + ")}`
  };
}
