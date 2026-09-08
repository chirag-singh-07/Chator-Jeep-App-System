import * as admin from "firebase-admin";
import { env } from "./env";

let firebaseApp: admin.app.App | null = null;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    let serviceAccountStr = (process.env.FIREBASE_SERVICE_ACCOUNT || "{}").trim();
    serviceAccountStr = serviceAccountStr.replace(/^['"]|['"]$/g, '');
    
    // Replace unescaped newlines with \n if any (sometimes dotenv keeps literal newlines in single quotes)
    // Actually, JSON.parse requires literal newlines inside strings to be escaped as \n
    // So we need to make sure the private_key newlines are valid JSON
    serviceAccountStr = serviceAccountStr.replace(/\r?\n/g, '\\n');

    const serviceAccount = JSON.parse(serviceAccountStr);
    
    if (!serviceAccount.project_id) {
      console.warn("Firebase service account not configured. Push notifications will be disabled.");
      return null;
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("Firebase Admin SDK initialized successfully");
    return firebaseApp;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
};

export const getFirebase = () => firebaseApp;
