import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDq9cI7jsdeSH4QVUAcxl-dP8Yb1sRIjUc",
  authDomain: "photobooth-26666.firebaseapp.com",
  projectId: "photobooth-26666",
  storageBucket: "photobooth-26666.firebasestorage.app",
  messagingSenderId: "724176430862",
  appId: "1:724176430862:web:1ed55db69a597f2a6d595f",
  measurementId: "G-BTDQZC7GFZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth & Firestore (No Firebase Storage)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

// Cloudinary Configuration for Image Storage
export const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/veyubpsm/image/upload";
export const CLOUDINARY_UPLOAD_PRESET = "photobooth_preset";

export default app;
