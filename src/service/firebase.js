// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
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
initializeApp(firebaseConfig);
const db = getFirestore();
const auth = getAuth();
export { db, auth }
