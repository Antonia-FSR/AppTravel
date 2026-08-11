import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import aiStudioConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || aiStudioConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || aiStudioConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || aiStudioConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || aiStudioConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || aiStudioConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || aiStudioConfig.appId,
};

const app = initializeApp(firebaseConfig);

// Usamos initializeFirestore con experimentalForceLongPolling para evitar errores de conexión
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true
}, import.meta.env.VITE_FIREBASE_PROJECT_ID ? "(default)" : aiStudioConfig.firestoreDatabaseId);

// NO QUITAR: Esto es necesario para el login anónimo
export const auth = getAuth(app);

export const loginAnonymously = async () => {
  try {
    await signInAnonymously(auth);
  } catch (error) {
    console.error("Error al iniciar sesión anónimamente", error);
  }
};
