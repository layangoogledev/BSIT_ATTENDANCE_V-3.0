const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

const db = admin.firestore();

/**
 * Server-Side Attendance Verification Function
 */
exports.verifyAndRecordAttendance = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
  }

  const { sessionId, deviceFingerprint, faceVector, gpsCoords, sessionCode } = data;
  const uid = context.auth.uid;

  // 1. Fetch Student Profile
  const studentDoc = await db.collection("students").doc(uid).get();
  if (!studentDoc.exists) throw new functions.https.HttpsError("not-found", "Student profile missing.");
  const student = studentDoc.data();

  // 2. Device Fingerprint Check
  if (student.deviceId && student.deviceId !== deviceFingerprint) {
    throw new functions.https.HttpsError("permission-denied", "Unauthorized device detected. Unbind required.");
  }

  // 3. Face Matching Euclidean Distance Logic
  const storedVector = student.faceEmbeddings;
  const distance = Math.sqrt(
    storedVector.reduce((sum, val, idx) => sum + Math.pow(val - faceVector[idx], 2), 0)
  );
  if (distance > 0.45) { // Match threshold
    throw new functions.https.HttpsError("invalid-argument", "Biometric face matching failed.");
  }

  // 4. Session Validation & Time Checking
  const sessionDoc = await db.collection("attendanceSessions").doc(sessionId).get();
  if (!sessionDoc.exists) throw new functions.https.HttpsError("not-found", "Session not found.");
  const session = sessionDoc.data();

  if (session.classMode === "f2f") {
    if (session.activeCode !== sessionCode) {
      throw new functions.https.HttpsError("invalid-argument", "Incorrect 4-digit session code.");
    }
  }

  // Calculate Attendance Status
  const now = admin.firestore.Timestamp.now();
  const startTime = session.startTime;
  const diffMinutes = (now.seconds - startTime.seconds) / 60;

  let status = "On-Time";
  if (diffMinutes > 0 && diffMinutes <= 10) {
    status = "Late";
  } else if (diffMinutes > 10) {
    status = "Absent";
  }

  // Write record safely using server timestamp
  const recordRef = db.collection("attendanceRecords").doc(`${sessionId}_${uid}`);
  await recordRef.set({
    sessionId,
    studentId: uid,
    studentNumber: student.studentNumber,
    fullName: student.fullName,
    section: student.section,
    timestamp: now,
    status,
    faceDistance: distance,
    verifiedByServer: true
  });

  return { success: true, status, faceDistance: distance };
});