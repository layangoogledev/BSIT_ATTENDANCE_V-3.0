import { auth, db } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getVerifiedLocation } from "./geo-location.js";
import { getDeviceFingerprint, generateMockEmbedding } from "./face-verify.js";

// Toggle Authentication UI Mode
window.switchTab = (tab) => {
  document.getElementById('student-section').classList.toggle('hidden', tab !== 'student');
  document.getElementById('admin-section').classList.toggle('hidden', tab !== 'admin');
  document.getElementById('tab-student').classList.toggle('active', tab === 'student');
  document.getElementById('tab-admin').classList.toggle('active', tab === 'admin');
};

window.setAuthMode = (mode) => {
  const isSignup = mode === 'signup';
  document.getElementById('signup-fields').classList.toggle('hidden', !isSignup);
  document.getElementById('btn-login-mode').classList.toggle('active', !isSignup);
  document.getElementById('btn-signup-mode').classList.toggle('active', isSignup);
  document.getElementById('btn-student-submit').innerText = isSignup ? 'Enroll & Register' : 'Sign In';
};

// Form Submission Handling
const studentForm = document.getElementById('student-form');
if (studentForm) {
  studentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentNum = document.getElementById('std-number').value.trim();
    const password = document.getElementById('std-password').value;
    const isSignup = !document.getElementById('signup-fields').classList.contains('hidden');
    const email = `${studentNum}@student.pamsu.edu.ph`;

    try {
      if (isSignup) {
        const name = document.getElementById('std-name').value;
        const section = document.getElementById('std-section').value;
        const deviceId = getDeviceFingerprint();
        const faceEmbeddings = generateMockEmbedding(); // Real face-api vector in full build

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "students", userCred.user.uid), {
          studentNumber: studentNum,
          fullName: name,
          section: section,
          deviceId: deviceId,
          faceEmbeddings: faceEmbeddings,
          createdAt: new Date().toISOString()
        });
        alert("Enrollment successful! Logging in...");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      window.location.href = "student-dashboard.html";
    } catch (err) {
      alert(`Authentication Error: ${err.message}`);
    }
  });
}