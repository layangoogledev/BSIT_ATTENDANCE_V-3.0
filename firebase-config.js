import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getFunctions } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js";

// Replace with your Firebase Web Config values from Console
const firebaseConfig = {
  apiKey: "AIzaSyBl472hHRVnTCOZH73hwo5oWQHmPEaEFfI",
  authDomain: "attendance-1b040.firebaseapp.com",
  projectId: "attendance-1b040",
  storageBucket: "attendance-1b040.firebasestorage.app",
  messagingSenderId: "327966137487",
  appId: "1:327966137487:web:7e831bfc09bdd910e5a4fa"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);