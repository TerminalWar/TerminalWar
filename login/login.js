import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { signUp, login } from "./auth.js";
import { runIntro, startMatrixRain } from "./intro.js";

const usernameInput = document.getElementById("username");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const statusMsg = document.getElementById("status");
const authPanel = document.getElementById("authPanel");

let introDone = false;
startMatrixRain();

function mapAuthError(errorCode) {
  switch (errorCode) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Wrong decrypt key.";
    case "auth/user-not-found":
      return "Neural_ID not found.";
    case "auth/email-already-in-use":
      return "Signal_Email already linked.";
    default:
      return "Access denied. Retry.";
  }
}

function redirectToGame() {
  window.location.href = "/game/";
}

function getCredentials() {
  return {
    username: usernameInput.value.trim(),
    email: emailInput.value.trim(),
    password: passwordInput.value
  };
}

loginBtn.addEventListener("click", async () => {
  const { email, password } = getCredentials();
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
  const { username, email, password } = getCredentials();
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
  if (user) return redirectToGame();

  if (!introDone) {
    await runIntro();
    introDone = true;
  }

  authPanel.classList.remove("hidden");
  statusMsg.textContent = "Ready for infiltration.";
});
