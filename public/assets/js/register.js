// register.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const auth = getAuth(app);

const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (password !== confirmPassword) {
    Swal.fire("รหัสผ่านไม่ตรงกัน", "กรุณากรอกให้ตรงกัน", "warning");
    return;
  }

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    await signOut(auth); // ❗️ออกจากระบบทันทีหลังสมัคร
    Swal.fire("สำเร็จ", "สมัครสมาชิกเรียบร้อย กรุณาเข้าสู่ระบบ", "success").then(() => {
      window.location.href = "login.html";
    });
  } catch (error) {
    Swal.fire("เกิดข้อผิดพลาด", error.message, "error");
  }
});
