import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// tumhari real Firebase configuration keys:
const firebaseConfig = {
  apiKey: "AIzaSyBr1g0UrJn2r2OPIyp9HmDIJjnHGlOa3SA",
  authDomain: "gemini-c8f09.firebaseapp.com",
  projectId: "gemini-c8f09",
  storageBucket: "gemini-c8f09.firebasestorage.app",
  messagingSenderId: "201610250155",
  appId: "1:201610250155:web:5a7bb7ddb02b0762d774ee",
  measurementId: "G-8C3X3WPL8N"
};

// Firebase initialize ho raha hai
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export { RecaptchaVerifier, signInWithPhoneNumber };