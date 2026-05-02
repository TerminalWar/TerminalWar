import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";

const textEl = document.getElementById("welcomeText");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login/";
    return;
  }

  const username = user.displayName || user.email || "Operator";
  textEl.textContent = `Hello World, ${username}. Welcome to Sector 204.`;
});
