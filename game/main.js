import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";
import { goToLogin } from "../shared/navigation.js";

const textEl = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");
const statusEl = document.getElementById("statusText");

logoutBtn.addEventListener("click", async () => {
  logoutBtn.disabled = true;
  statusEl.textContent = "Signing out...";

  try {
    await signOut(auth);
    statusEl.textContent = "Signed out. Redirecting...";
    goToLogin("?loggedOut=1");
  } catch (error) {
    console.error("Logout failed", error);
    statusEl.textContent = "Logout failed. Try again.";
    logoutBtn.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    goToLogin();
    return;
  }

  const username = user.displayName || user.email || "Operator";
  textEl.textContent = `Hello World, ${username}. Welcome to Sector 204.`;
  statusEl.textContent = "Authenticated session active.";
  logoutBtn.disabled = false;
});
