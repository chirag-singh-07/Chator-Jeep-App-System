import * as admin from "firebase-admin";
import { env } from "./env";

let firebaseApp: admin.app.App | null = null;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}");
    
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
