import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { applyViewportProfile } from "../shared/device.js";
import { auth } from "../shared/firebase.js";
import { UI_CONFIG } from "../game/config/ui.config.js";
import { signUp, login } from "./auth.js";
import { runIntro, startMatrixRain } from "./intro.js";
import { goToGame, replaceLoginUrl } from "../shared/navigation.js";

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const switchBtn = document.getElementById("switchModeBtn");
const forceLogoutBtn = document.getElementById("forceLogoutBtn");
const statusMsg = document.getElementById("status");
const authPanel = document.getElementById("authPanel");
const postLoginCutscene = document.getElementById("postLoginCutscene");
const introPanel = document.getElementById("intro");
const subtitle = document.getElementById("subtitle");
const gameplayTip = document.getElementById("gameplayTip");
const skipCutsceneBtn = document.getElementById("skipCutsceneBtn");
const assetPercent = document.getElementById("assetPercent");
const togglePasswordBtn = document.getElementById("togglePasswordBtn");

let flowState = "boot";
let handoffTimer;
let handoffCountdownTimer;
let handoffWatchdogTimer;

function configureViewportMode() {
  return applyViewportProfile({
    mobileMaxWidth: UI_CONFIG.windows.mobileBreakpoint,
    compactMaxWidth: UI_CONFIG.windows.compactBreakpoint
  });
}

configureViewportMode();
window.addEventListener("resize", configureViewportMode, { passive: true });

const gameplayTips = [
  "Keep your signal quiet. Loud commands wake stronger countermeasures.",
  "Recon first: every dead node can still hide a live trace.",
  "If the grid starts hunting you, break line-of-sight and reroute.",
  "Salvage data before credits. In Sector 204, intel buys survival."
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHandoffDelay() {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const deviceMode = document.body.dataset.device;
  const base = prefersReducedMotion || deviceMode === "mobile" ? UI_CONFIG.login.minHandoffDelayMs : UI_CONFIG.login.handoffDelayMs;
  return Math.max(UI_CONFIG.login.minHandoffDelayMs, base);
}

function startCountdown(ms) {
  window.clearInterval(handoffCountdownTimer);
  const startedAt = Date.now();
  handoffCountdownTimer = window.setInterval(() => {
    const left = Math.max(0, Math.ceil((ms - (Date.now() - startedAt)) / 1000));
    assetPercent.textContent = `SECURE HANDOFF // ${String(left).padStart(2, "0")} SEC`;
  }, 250);
}

function finishHandoff() {
  window.clearTimeout(handoffTimer);
  window.clearTimeout(handoffWatchdogTimer);
  window.clearInterval(handoffCountdownTimer);
  flowState = "handoff-complete";
  goToGame();
}

async function enterGameWithCutscene() {
  if (flowState === "handoff" || flowState === "handoff-complete") return;
  flowState = "handoff";

  statusMsg.textContent = "Clearance accepted. Opening war-room uplink...";
  authPanel.classList.add("hidden");
  introPanel.classList.add("hidden");
  postLoginCutscene.classList.remove("hidden");
  document.body.dataset.sequence = "handoff";
  gameplayTip.textContent = gameplayTips[Math.floor(Math.random() * gameplayTips.length)];

  const delay = getHandoffDelay();
  startCountdown(delay);
  handoffTimer = window.setTimeout(finishHandoff, delay);
  handoffWatchdogTimer = window.setTimeout(finishHandoff, delay + 3000);
}

let introDone = false;
let isSignupMode = false;
startMatrixRain();

const params = new URLSearchParams(window.location.search);
const loggedOutFlag = params.get("loggedOut") === "1";

function setMode(signupMode) {
  isSignupMode = signupMode;
  usernameInput.closest(".field").classList.toggle("hidden", !signupMode);
  signupBtn.classList.toggle("hidden", !signupMode);
  loginBtn.classList.toggle("hidden", signupMode);
  passwordInput.autocomplete = signupMode ? "new-password" : "current-password";
  switchBtn.textContent = signupMode ? "Return to Operator Authorization" : "Request New Blackline Callsign";
  subtitle.textContent = signupMode ? "Enroll a cleared asset into the Sector 204 command ledger." : "Unauthorized presence detected. Prove clearance before the grid notices.";
  statusMsg.textContent = signupMode ? "Awaiting asset registration packet." : "Ashfall uplink quiet. Secure gate standing by.";
}

function mapAuthError(errorCode) {
  switch (errorCode) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Cipher key rejected by blackline command. (Wrong password)";
    case "auth/user-not-found":
      return "No cleared operator found in the ghost ledger.";
    case "auth/email-already-in-use":
      return "Command channel already bound to a cleared asset.";
    case "auth/weak-password":
      return "Cipher key too weak. Use at least 6 characters.";
    case "auth/invalid-email":
      return "Command channel must be a valid email address.";
    default:
      return "Access denied by strategic gate. Retry.";
  }
}

function setAuthButtonsDisabled(disabled) {
  loginBtn.disabled = disabled;
  signupBtn.disabled = disabled;
  switchBtn.disabled = disabled;
}

switchBtn.addEventListener("click", () => setMode(!isSignupMode));

togglePasswordBtn?.addEventListener("click", () => {
  const nextType = passwordInput.type === "password" ? "text" : "password";
  passwordInput.type = nextType;
  togglePasswordBtn.textContent = nextType === "password" ? "Show" : "Hide";
});

skipCutsceneBtn?.addEventListener("click", async () => {
  if (flowState !== "handoff") return;
  skipCutsceneBtn.disabled = true;
  skipCutsceneBtn.textContent = "Continuing...";
  await wait(UI_CONFIG.login.skipDelayMs);
  finishHandoff();
});

forceLogoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  statusMsg.textContent = "Local clearance cache purged. Gate reset.";
});

async function doAuth(action) {
  setAuthButtonsDisabled(true);
  try {
    await action();
    await enterGameWithCutscene();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
    setAuthButtonsDisabled(false);
  }
}

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) {
    statusMsg.textContent = "Command channel and cipher key required.";
    return;
  }

  statusMsg.textContent = "Verifying operator clearance...";
  await doAuth(() => login(email, password));
});

signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!username || !email || !password) {
    statusMsg.textContent = "Callsign, channel, and cipher key required.";
    return;
  }

  statusMsg.textContent = "Registering cleared blackline asset...";
  await doAuth(() => signUp(email, password, username));
});

passwordInput.addEventListener("keydown", async (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  if (isSignupMode) await signupBtn.click();
  else await loginBtn.click();
});

onAuthStateChanged(auth, async (user) => {
  if (user && !loggedOutFlag) return enterGameWithCutscene();

  if (!introDone) {
    flowState = "intro";
    await runIntro();
    introDone = true;
  }

  flowState = "auth";
  authPanel.classList.remove("hidden");
  setMode(false);
  skipCutsceneBtn.disabled = false;
  skipCutsceneBtn.textContent = "Skip cinematic and continue";
  emailInput.focus();

  if (loggedOutFlag) {
    statusMsg.textContent = "Operator signed out. Blackline gate reset.";
    replaceLoginUrl();
  }
});
