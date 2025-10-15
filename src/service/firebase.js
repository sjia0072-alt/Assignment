// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'
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
if (window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.log('Connected to Firebase Functions emulator');
}

export { db, auth, functions }
