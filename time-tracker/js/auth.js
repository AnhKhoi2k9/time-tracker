import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDpdBTdauiwq0RU1lic4kBlMoVbjdW4-co",
  authDomain: "yghgjhg.firebaseapp.com",
  projectId: "yghgjhg",
  storageBucket: "yghgjhg.firebasestorage.app",
  messagingSenderId: "164220086048",
  appId: "1:164220086048:web:25f38250b06d16d2b7d945",
  measurementId: "G-ZF9FRKRCF9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Gắn event vào nút login/logout
document.getElementById("loginBtn").onclick = () => {
  signInWithPopup(auth, provider);
};
document.getElementById("logoutBtn").onclick = () => {
  signOut(auth);
};

// Quan sát trạng thái login
onAuthStateChanged(auth, (user) => {
  if (user) {
    document.getElementById("userInfo").textContent = `👤 ${user.displayName}`;
  } else {
    document.getElementById("userInfo").textContent = "Not logged in";
  }
});

export { auth };
