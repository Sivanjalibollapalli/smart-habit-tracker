// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBTNfgigDebg23VbX7CO1AYD2JkUnxbyFc",
  authDomain: "smart-habit-tracker-aa07e.firebaseapp.com",
  projectId: "smart-habit-tracker-aa07e",
  storageBucket: "smart-habit-tracker-aa07e.firebasestorage.app",
  messagingSenderId: "231911916967",
  appId: "1:231911916967:web:85fee39e7a98379214e282",
  measurementId: "G-WJDYCVNMBJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup };
