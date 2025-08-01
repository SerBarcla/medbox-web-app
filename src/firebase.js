// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// PASTE YOUR FIREBASE CONFIG OBJECT HERE
const firebaseConfig = {
  "projectId": "medbox-app-082542069",
  "appId": "1:1028707957669:web:577df78ccbba8986b2c64c",
  "storageBucket": "medbox-app-082542069.firebasestorage.app",
  "apiKey": "AIzaSyDtuhIUvxjQO3PzkxXM2PYCF1n78QDVJEc",
  "authDomain": "medbox-app-082542069.firebaseapp.com",
  "messagingSenderId": "1028707957669"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the services you'll need
export const auth = getAuth(app);
export const db = getFirestore(app);