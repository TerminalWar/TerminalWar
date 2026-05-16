import { doc, getDoc, serverTimestamp, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { db } from "../../shared/firebase.js";
import { GAME_CONFIG } from "../config/game.config.js";

const DEFAULT_PROFILE = {
  economy: {
    credits: 0,
    lifetimeEarned: 0,
    stockPortfolioValue: 0
  },
  progression: {
    hackingRank: 0,
    xp: 0,
    storyFlags: []
  },
  inventory: {
    seasonalItems: [],
    scriptsOwned: [],
    dronesOwned: []
  },
  desktop: {
    osName: GAME_CONFIG.osName,
    sectorName: GAME_CONFIG.sectorName,
    wallpaperPreset: "aacr-blacksite",
    preferredApps: ["files", "terminal", "shop", "settings"]
  },
  telemetry: {
    currentRoute: "/game/",
    lastKnownClient: "desktop-browser"
  }
};

export async function ensurePlayerGameProfile(user) {
  if (!user) return null;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  const currentGameProfile = snapshot.exists() ? snapshot.data().game : null;

  await setDoc(userRef, {
    email: user.email || null,
    username: user.displayName || user.email || "Wasteland Operator",
    lastLoginAt: serverTimestamp(),
    ...(currentGameProfile ? {} : { game: DEFAULT_PROFILE })
  }, { merge: true });

  return userRef;
}

export async function savePlayerRoute(user, path = window.location.pathname) {
  if (!user) return;

  await setDoc(doc(db, "users", user.uid), {
    game: {
      telemetry: {
        currentRoute: path,
        lastRouteSavedAt: serverTimestamp(),
        lastKnownClient: "desktop-browser"
      }
    }
  }, { merge: true });
}
