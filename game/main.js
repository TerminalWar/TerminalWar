import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";

const textEl = document.getElementById("welcomeText");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "/login/";
});

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login/";
    return;
  }

  const username = user.displayName || user.email || "Operator";
  textEl.textContent = `Hello World, ${username}. Welcome to Sector 204.`;
});
