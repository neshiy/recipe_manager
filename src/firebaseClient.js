import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

function isMissing(value) {
  const v = String(value || "").trim();
  if (!v) return true;
  if (v === "YOUR_API_KEY" || v === "YOUR_PROJECT_ID") return true;
  if (v.includes("<") || v.includes(">")) return true;
  return false;
}

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const requiredKeys = ["apiKey", "authDomain", "projectId", "appId"];
const missingKeys = requiredKeys.filter((k) => isMissing(firebaseConfig[k]));

export const firebaseEnabled = missingKeys.length === 0;

const storageBucketMissing = isMissing(firebaseConfig.storageBucket);
export const firebaseStorageEnabled = firebaseEnabled && !storageBucketMissing;

if (!firebaseEnabled) {
  // Allow running the app without Auth configured (demo mode).
  // Auth-related UI will show a message instead.
  // eslint-disable-next-line no-console
  console.warn(
    `Firebase Auth not configured. Missing: ${missingKeys.join(", ")}. ` +
      `Create client/.env with REACT_APP_FIREBASE_* from Firebase Console → Project settings → Your apps (Web app), then restart npm start.`
  );
}

export const firebaseApp = firebaseEnabled ? initializeApp(firebaseConfig) : null;
export const firebaseAuth = firebaseEnabled ? getAuth(firebaseApp) : null;
export const firebaseStorage = firebaseStorageEnabled ? getStorage(firebaseApp) : null;
