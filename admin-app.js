import { auth, db } from "./firebase-config.js";
import { collection, onSnapshot, doc, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Real-time Attendance Listener
const rowsContainer = document.getElementById('attendance-live-rows');
if (rowsContainer) {
  const q = query(collection(db, "attendanceRecords"), orderBy("timestamp", "desc"));
  
  onSnapshot(q, (snapshot) => {
    rowsContainer.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${data.studentNumber}</td>
        <td>${data.fullName || 'N/A'}</td>
        <td>${data.section || 'N/A'}</td>
        <td>${data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : 'N/A'}</td>
        <td><span class="status-pill ${getStatusClass(data.status)}">${data.status}</span></td>
        <td>${data.faceDistance ? data.faceDistance.toFixed(3) : 'N/A'}</td>
      `;
      rowsContainer.appendChild(tr);
    });
  });
}

function getStatusClass(status) {
  if (status === 'On-Time') return 'success';
  if (status === 'Late') return 'warn';
  return 'danger';
}

// Unbind Device Trigger
const unbindBtn = document.getElementById('btn-unbind-device');
if (unbindBtn) {
  unbindBtn.addEventListener('click', async () => {
    const stdId = document.getElementById('unbind-std-id').value.trim();
    if (!stdId) return alert("Please enter a Student ID");
    
    try {
      await updateDoc(doc(db, "students", stdId), { deviceId: null });
      alert(`Device unbound for Student: ${stdId}`);
    } catch (err) {
      alert(`Error unbinding device: ${err.message}`);
    }
  });
}