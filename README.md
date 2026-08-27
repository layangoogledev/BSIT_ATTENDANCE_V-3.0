# PamSU BSIT Attendance Portal — Fixes Applied

## What was broken (see full breakdown in chat)
- Admin login had no handler; admin dashboard buttons (session gen, CSV
  export, roster import, logout) were all unwired.
- Student dashboard (logout, class list, check-in modal, face capture,
  excuse form) was entirely unwired despite the markup existing.
- The check-in flow never called the geolocation, face-distance, or
  Cloud Function code that already existed in the project.
- Cloud Function had no package.json/firebase.json/.firebaserc — undeployable.
- Firestore rule let students overwrite their own `deviceId` and
  `faceEmbeddings`, defeating the anti-proxy design.
- Server never re-verified the geofence — a modified client could fake GPS.
- Admin dashboard used `innerHTML` with student-supplied data (stored XSS).
- `generateMockEmbedding()` returned random noise — biometric match could
  never work. Replaced with real face-api.js webcam capture.
- Device unbind looked students up by the wrong document ID.
- No duplicate check-in guard, no session `status === "open"` check.

## Before deploying, you still need to do this manually

1. **Install the Firebase CLI** and log in: `npm i -g firebase-tools && firebase login`
2. **Deploy Firestore rules**: `firebase deploy --only firestore:rules`
3. **Deploy the Cloud Function**:
   ```
   cd functions && npm install
   cd ..
   firebase deploy --only functions
   ```
4. **Create the first admin account manually** — there is no self-serve
   admin signup by design. In the Firebase Console, create a user under
   Authentication, then add a document at `admins/{that user's UID}`
   in Firestore (any fields, e.g. `{ "role": "faculty" }`) so the
   `isAdmin()` rule check passes.
5. **Composite index**: the student dashboard's active-session query
   (`where section == ... AND where status == "open"`) needs a composite
   index. The first time it runs, open the browser console — Firestore
   will print a direct link to create it. Click it once; no manual config.
6. **Restrict the Firebase Web API key** to your real domain(s) in
   Firebase Console → Authentication → Settings → Authorized domains
   (the key itself is meant to be public; access control is enforced by
   firestore.rules, which is why step 2 matters).
7. **Roster import** only stages rows into a `studentsRoster` collection
   for admin reference — it does not create Firebase Auth accounts
   (that requires the Admin SDK, which can't run from browser JS).
   Students still self-enroll via the signup form.
8. **Excuse letter file attachment** is currently not uploaded anywhere.
   If you need that, add a Firebase Storage upload in the excuse-form
   handler in `student-app.js` and store the resulting download URL.

## Face recognition note
Face capture now uses face-api.js (loaded from CDN) with a tiny face
detector + 128-d recognition model. First load will be slow (~1-2MB of
model weights) — consider self-hosting the model files under your own
domain for production instead of relying on the CDN.
