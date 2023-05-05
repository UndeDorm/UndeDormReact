import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  sendPasswordResetEmail, 
  confirmPasswordReset 
} from 'firebase/auth';
import { getStorage, ref } from 'firebase/storage';
import { GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export const passwordReset = async (email: string) => {
  return await sendPasswordResetEmail(auth, email)
}

export const confirmThePasswordReset = async (
  oobCode: string, newPassword: string
) => {
  if(!oobCode && !newPassword) return;

  return await confirmPasswordReset(auth, oobCode, newPassword)
}

export const provider = new GoogleAuthProvider();

export const firebaseDb = getFirestore(app);

export const storage = getStorage(app);
export const storageRef = ref(storage);
export const hotelImagesRef = ref(storage, 'images/hotels');
export const roomsImagesRef = ref(storage, 'images/rooms');