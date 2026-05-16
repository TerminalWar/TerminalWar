import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
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

function configureViewportMode() {
  const width = window.innerWidth;
  const hasTouch = window.matchMedia("(pointer: coarse)").matches;
  const deviceMemory = navigator.deviceMemory || 8;
  const cpuCores = navigator.hardwareConcurrency || 8;
  const isMobile = width <= 640;
  const isTablet = !isMobile && (width <= 1180 || hasTouch);
  const isLowPower = isMobile || isTablet || deviceMemory <= 4 || cpuCores <= 4;

  document.body.dataset.device = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";
  document.body.dataset.performance = isLowPower ? "low" : "high";
  document.documentElement.style.setProperty("--app-vh", `${window.innerHeight * 0.01}px`);
}

configureViewportMode();
window.addEventListener("resize", configureViewportMode, { passive: true });

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enterGameWithCutscene() {
  if (transferStarted) return;
  transferStarted = true;

  statusMsg.textContent = "Clearance accepted. Opening war-room uplink...";
  authPanel.classList.add("hidden");
  introPanel.classList.add("hidden");
  postLoginCutscene.classList.remove("hidden");
  document.body.dataset.sequence = "handoff";

  const isLowPower = document.body.dataset.performance === "low";
  await wait(isLowPower ? 5200 : 6400);
  goToGame();
}

let introDone = false;
let isSignupMode = false;
let transferStarted = false;
startMatrixRain();

const params = new URLSearchParams(window.location.search);
const loggedOutFlag = params.get("loggedOut") === "1";

function setMode(signupMode) {
  isSignupMode = signupMode;
  usernameInput.closest(".field").classList.toggle("hidden", !signupMode);
  signupBtn.classList.toggle("hidden", !signupMode);
  loginBtn.classList.toggle("hidden", signupMode);
  switchBtn.textContent = signupMode ? "Return to Operator Authorization" : "Request New Blackline Callsign";
  subtitle.textContent = signupMode ? "Enroll a cleared asset into the Sector 204 command ledger." : "Unauthorized presence detected. Prove clearance before the grid notices.";
  statusMsg.textContent = signupMode ? "Awaiting asset registration packet." : "Ashfall uplink quiet. Secure gate standing by.";
}

function mapAuthError(errorCode) {
  switch (errorCode) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Cipher key rejected by blackline command.";
    case "auth/user-not-found":
      return "No cleared operator found in the ghost ledger.";
    case "auth/email-already-in-use":
      return "Command channel already bound to a cleared asset.";
    default:
      return "Access denied by strategic gate. Retry.";
  }
}

switchBtn.addEventListener("click", () => setMode(!isSignupMode));

forceLogoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  statusMsg.textContent = "Local clearance cache purged. Gate reset.";
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return (statusMsg.textContent = "Command channel and cipher key required.");

  statusMsg.textContent = "Verifying operator clearance...";
  try {
    await login(email, password);
    await enterGameWithCutscene();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
  }
});

signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!username || !email || !password) return (statusMsg.textContent = "Callsign, channel, and cipher key required.");

  statusMsg.textContent = "Registering cleared blackline asset...";
  try {
    await signUp(email, password, username);
    await enterGameWithCutscene();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user && !loggedOutFlag) return enterGameWithCutscene();

  if (!introDone) {
    await runIntro();
    introDone = true;
  }

  authPanel.classList.remove("hidden");
  setMode(false);

  if (loggedOutFlag) {
    statusMsg.textContent = "Operator signed out. Blackline gate reset.";
    replaceLoginUrl();
  }
});
