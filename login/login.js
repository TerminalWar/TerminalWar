import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { signUp, login } from "./auth.js";
import { runIntro } from "./intro.js";

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const statusMsg = document.getElementById("status");
const authPanel = document.getElementById("authPanel");

let introDone = false;

function mapAuthError(errorCode) {
  switch (errorCode) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Wrong password. Try again.";
    case "auth/user-not-found":
      return "User not found. Sign up first.";
    case "auth/email-already-in-use":
      return "Email already in use. Log in instead.";
    case "auth/invalid-email":
      return "Invalid email format.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    default:
      return "Authentication failed. Please try again.";
  }
}

function redirectToGame() {
  window.location.href = "/game/";
}

function getCredentials() {
  return {
    email: emailInput.value.trim(),
    password: passwordInput.value
  };
}

function validateFields(email, password) {
  if (!email || !password) {
    statusMsg.textContent = "Email and password are required.";
    return false;
  }
  return true;
}

loginBtn.addEventListener("click", async () => {
  const { email, password } = getCredentials();
  if (!validateFields(email, password)) return;

  statusMsg.textContent = "Logging in...";
  try {
    await login(email, password);
    redirectToGame();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
  }
});

signupBtn.addEventListener("click", async () => {
  const { email, password } = getCredentials();
  if (!validateFields(email, password)) return;

  statusMsg.textContent = "Creating account...";
  try {
    await signUp(email, password);
    redirectToGame();
  } catch (error) {
    statusMsg.textContent = mapAuthError(error.code);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    redirectToGame();
    return;
  }

  if (!introDone) {
    await runIntro();
    introDone = true;
  }

  authPanel.classList.remove("hidden");
  statusMsg.textContent = "Ready.";
});
