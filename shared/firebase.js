import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAnalytics, isSupported } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyDx95D61xjUhl4PBmPMIeFMov7sg62Dnk4",
  authDomain: "terminalwar-918ae.firebaseapp.com",
  databaseURL: "https://terminalwar-918ae-default-rtdb.firebaseio.com",
  projectId: "terminalwar-918ae",
  storageBucket: "terminalwar-918ae.firebasestorage.app",
  messagingSenderId: "1030414460359",
  appId: "1:1030414460359:web:1fbc22c324eea2a73865e2",
  measurementId: "G-ELDEY1DEYN"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence setup failed:", error);
});

isSupported()
  .then((ok) => {
    if (ok) getAnalytics(app);
  })
  .catch(() => {
    // analytics is optional in this phase
  });

export { app, auth, db };
