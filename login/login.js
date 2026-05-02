import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { signUp, login } from "./auth.js";
import { runIntro, startMatrixRain } from "./intro.js";

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const switchBtn = document.getElementById("switchModeBtn");
const forceLogoutBtn = document.getElementById("forceLogoutBtn");
const statusMsg = document.getElementById("status");
const authPanel = document.getElementById("authPanel");
const subtitle = document.getElementById("subtitle");

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
  switchBtn.textContent = signupMode ? "Already have access? Log In" : "Need a Neural_ID? Sign Up";
  subtitle.textContent = signupMode ? "Register Operator in Sector 204" : "Welcome to Sector 204";
  statusMsg.textContent = signupMode ? "Create your operator profile." : "Ready for infiltration.";
}

function mapAuthError(errorCode) {
  switch (errorCode) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Wrong decrypt key.";
    case "auth/user-not-found":
      return "Operator not found.";
    case "auth/email-already-in-use":
      return "Signal_Email already linked.";
    default:
      return "Access denied. Retry.";
  }
}

function redirectToGame() {
  window.location.href = "/game/";
}

switchBtn.addEventListener("click", () => setMode(!isSignupMode));

forceLogoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  statusMsg.textContent = "Session cleared. You can test login again.";
});

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!email || !password) return (statusMsg.textContent = "Email + key required.");

  statusMsg.textContent = "Verifying credentials...";
  try {
    await login(email, password);
    redirectToGame();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
  }
});

signupBtn.addEventListener("click", async () => {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  if (!username || !email || !password) return (statusMsg.textContent = "Username, email, and key required.");

  statusMsg.textContent = "Registering Neural_ID...";
  try {
    await signUp(email, password, username);
    redirectToGame();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user && !loggedOutFlag) return redirectToGame();

  if (!introDone) {
    await runIntro();
    introDone = true;
  }

  authPanel.classList.remove("hidden");
  setMode(false);

  if (loggedOutFlag) {
    statusMsg.textContent = "Logged out successfully. Test away.";
    window.history.replaceState({}, "", "/login/");
  }
});
