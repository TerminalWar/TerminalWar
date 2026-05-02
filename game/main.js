import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { auth } from "../shared/firebase.js";

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "/login/";
  }
});
