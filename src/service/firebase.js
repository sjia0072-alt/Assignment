// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQtA_4X0gn56OI8TJvG1jJUTmj_3TpF_0",
  authDomain: "assignment-shuhong.firebaseapp.com",
  projectId: "assignment-shuhong",
  storageBucket: "assignment-shuhong.firebasestorage.app",
  messagingSenderId: "86132268487",
  appId: "1:86132268487:web:11c992ad965919e4ed4de2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Initialize Functions and connect to emulator (for development)
const functions = getFunctions(app);
connectFunctionsEmulator(functions, 'localhost', 5001);
console.log('Connected to Firebase Functions emulator');

// Initialize AI service
let ai = null;
let model = null;

try {
  // Initialize the Gemini Developer API backend service
  ai = getAI(app, { backend: new GoogleAIBackend() });

  // Create a `GenerativeModel` instance
  model = getGenerativeModel(ai, { model: "gemini-2.5-flash-lite" });

  console.log('Firebase AI initialized successfully');
} catch (error) {
  console.warn('Failed to initialize Firebase AI:', error.message);
  // AI service will be unavailable, but other Firebase services will work
}

export { db, auth, functions, ai, model }
