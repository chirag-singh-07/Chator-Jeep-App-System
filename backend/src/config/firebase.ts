import * as admin from "firebase-admin";
import { env } from "./env";

let firebaseApp: admin.app.App | null = null;

export const initFirebase = () => {
  if (firebaseApp) return firebaseApp;

  try {
    let serviceAccountStr = process.env.FIREBASE_SERVICE_ACCOUNT || "{}";
    if ((serviceAccountStr.startsWith("'") && serviceAccountStr.endsWith("'")) ||
        (serviceAccountStr.startsWith('"') && serviceAccountStr.endsWith('"'))) {
      serviceAccountStr = serviceAccountStr.slice(1, -1);
    }
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
