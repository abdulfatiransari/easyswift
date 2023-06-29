// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBYGWjpVxPjxxyatJ5OSQ1dVGbD06ehBCc",
  authDomain: "easyswift-80ac8.firebaseapp.com",
  projectId: "easyswift-80ac8",
  storageBucket: "easyswift-80ac8.appspot.com",
  messagingSenderId: "91312881245",
  appId: "1:91312881245:web:bd7f52601c98e08ea1d7b4",
  measurementId: "G-N9C7EH4426",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
export { db };
