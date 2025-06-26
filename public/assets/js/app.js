import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth(app);

let currentUser = null;
let isAdmin = false;
const ADMIN_EMAIL = "it.swp01@gmail.com";

onAuthStateChanged(auth, user => {
  currentUser = user;
  isAdmin = user && user.email === ADMIN_EMAIL;
  // ถ้าต้องการอัปเดต UI ใด ๆ ก็ทำตรงนี้ได้
});

const form = document.getElementById("bookingForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const userNameInput = document.getElementById("userName");
  const roomId = document.getElementById("roomSelect").value;
  const date = document.getElementById("dateInput").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  const user = currentUser ? currentUser.email : userNameInput.value.trim();

  if (!user) {
    Swal.fire({
      icon: 'error',
      title: 'กรุณากรอกชื่อผู้จอง หรือเข้าสู่ระบบ',
    });
    return;
  }

  Swal.fire({
    html: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(bookingsRef,
      where("roomId", "==", roomId),
      where("date", "==", date)
    );

    const snapshot = await getDocs(q);

    const conflict = snapshot.docs.some(doc => {
      const data = doc.data();
      return (startTime < data.endTime && endTime > data.startTime);
    });

    Swal.close();

    if (conflict) {
      Swal.fire({
        icon: "error",
        title: "ห้องถูกจองแล้ว",
        text: "❌ ห้องถูกจองในช่วงเวลาดังกล่าวแล้ว กรุณาเลือกเวลาอื่น",
        confirmButtonText: "ตกลง"
        
      });
      return;
    }

    await addDoc(bookingsRef, {
      roomId,
      user,
      date,
      startTime,
      endTime,
      uid: currentUser ? currentUser.uid : null,
      isGuest: currentUser ? false : true,
    });

    Swal.fire({
      icon: "success",
      title: "จองห้องสำเร็จ!",
      confirmButtonText: "ตกลง",
      customClass: {
        confirmButton: 'swal-ok-btn'
      }
    });

    form.reset();

  } catch (error) {
    console.error(error);
    Swal.close();
    Swal.fire({
      icon: "warning",
      title: "เกิดข้อผิดพลาด",
      text: "ไม่สามารถจองห้องได้ กรุณาลองใหม่อีกครั้ง",
      confirmButtonText: "ตกลง",
       customClass: {
        confirmButton: 'swal-ok-btn'
      }
    });
  }
});

// โค้ดเช็คสถานะห้องประชุม (checkRoomStatusNow) ใส่เหมือนเดิมตามที่คุณมี

//----- แสดงห้องที่ไม่ว่าง ------

async function checkRoomStatusNow() {
  const now = new Date();
  const today = now.toISOString().split("T")[0]; // yyyy-mm-dd
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM

  function formatThaiDate(dateStr) {
  const [yyyy, mm, dd] = dateStr.split("-");
  const buddhistYear = parseInt(yyyy) + 543;
  return `${dd}/${mm}/${buddhistYear}`;
  }

  const rooms = [
    "ห้องประชุม Moshi & DIY",
    "ห้องประชุม SWP",
    "ห้องประชุม GM",
    "ห้องประชุม MD",
    "ห้องประชุม ห้องไม้",
    "ห้องประชุม QM"
  ];
  const roomStatusList = document.getElementById("roomStatus");

  if (!roomStatusList) return;

  let statusHtml = "";

  const bookingsRef = collection(db, "bookings");
  const q = query(bookingsRef, where("date", ">=", today));
  const snapshot = await getDocs(q);

  for (const roomId of rooms) {
    // bookings ของห้องนี้
    const roomBookings = snapshot.docs
      .map(doc => doc.data())
      .filter(data => data.roomId === roomId);

    // มีรอบที่ใช้ตอนนี้ไหม
    const isOccupied = roomBookings.some(data =>
      data.date === today &&
      data.startTime <= currentTime &&
      data.endTime > currentTime
    );

    let statusText = "";
    let color = isOccupied ? 'red' : 'green';

    if (isOccupied) {
      statusText = `❌ ${roomId}: ไม่ว่าง`;
    } else {
      // หา booking ถัดไปหลัง currentTime
      const nextBooking = roomBookings
        .filter(b => {
          return (
            b.date > today || (b.date === today && b.startTime > currentTime)
          );
        })
        .sort((a, b) => {
          const dtA = `${a.date} ${a.startTime}`;
          const dtB = `${b.date} ${b.startTime}`;
          return dtA.localeCompare(dtB);
        })[0];

      if (nextBooking) {
  statusText = `✅ ${roomId}: ว่าง (รอบถัดไป: วันที่ ${formatThaiDate(nextBooking.date)} ${nextBooking.startTime} - ${nextBooking.endTime} )`;
} else {
  statusText = `✅ ${roomId}: ว่าง (ไม่มีรอบถัดไป)`;
}

    }

    statusHtml += `<p style="color:${color}; margin: 4px 0;">${statusText}</p>`;
  }

  roomStatusList.innerHTML = statusHtml;
}

checkRoomStatusNow();
setInterval(checkRoomStatusNow, 60000);

//----- แสดงห้องที่ไม่ว่าง ------

