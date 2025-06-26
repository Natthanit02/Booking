import { db } from "./firebaseConfig.js";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const tableBody = document.getElementById("bookingTableBody");
const auth = getAuth();

let currentUser = null;
let isAdmin = false;
const ADMIN_EMAIL = "admin@example.com";

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  isAdmin = user && user.email === ADMIN_EMAIL;
  loadBookings();
});

async function loadBookings() {
  try {
    const bookingsRef = collection(db, "bookings");
    const q = query(
      bookingsRef,
      orderBy("date", "desc"),
      orderBy("startTime", "asc")
    );
    const snapshot = await getDocs(q);

    tableBody.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const docId = docSnap.id;

      const formattedDate = new Date(data.date).toLocaleDateString("th-TH", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      let canDelete = false;
      if (isAdmin) {
        canDelete = true;
      } else if (currentUser) {
        // ลบได้เฉพาะรายการที่เป็นของตัวเอง หรือ guest
        canDelete = data.uid === currentUser.uid || data.isGuest === true;
      } else {
        // guest ลบได้เฉพาะ guest เท่านั้น
        canDelete = data.isGuest === true;
      }

      console.log("currentUser:", currentUser);
      console.log("data.isGuest:", data.isGuest);

      const deleteBtnHtml = canDelete
        ? `<button class="delete-btn" data-id="${docId}">🗑 ลบ</button>`
        : "";

      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${data.user}</td>
        <td>${data.roomId}</td>
        <td>${formattedDate}</td>
        <td>${data.startTime}</td>
        <td>${data.endTime}</td>
        <td>${deleteBtnHtml}</td>
      `;

      tableBody.appendChild(row);
    });

    attachDeleteEvents();
  } catch (error) {
    console.error("เกิดข้อผิดพลาดในการโหลดข้อมูล:", error);
    tableBody.innerHTML =
      "<tr><td colspan='6'>ไม่สามารถโหลดข้อมูลได้</td></tr>";
  }
}

function attachDeleteEvents() {
  const deleteButtons = document.querySelectorAll(".delete-btn");

  deleteButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.getAttribute("data-id");
      if (!id) return;

      const result = await Swal.fire({
        title: "คุณแน่ใจหรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ลบ",
        cancelButtonText: "ยกเลิก",
        buttonsStyling: false,
        customClass: {
          confirmButton: "swal-confirm",
          cancelButton: "swal-cancel",
          actions: "swal-actions",
          popup: "swal-popup-center",
        },
      });

      if (result.isConfirmed) {
        try {
          await deleteDoc(doc(db, "bookings", id));
          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ!",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "swal-ok-btn",
            },
          });
          loadBookings();
        } catch (err) {
          console.error("ลบไม่สำเร็จ:", err);
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            confirmButtonText: "ตกลง",
            customClass: {
              confirmButton: "swal-ok-btn",
            },
          });
        }
      }
    });
  });
}
