// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAd7bpCPw1oWtiGxlEtCFeGlz8VWJyl2qU",
  authDomain: "booking-5e179.firebaseapp.com",
  projectId: "booking-5e179",
  storageBucket: "booking-5e179.firebasestorage.app",
  messagingSenderId: "366969810084",
  appId: "1:366969810084:web:691d6fdba8cf1f12c94a31",
  measurementId: "G-25NZLH1E04"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
