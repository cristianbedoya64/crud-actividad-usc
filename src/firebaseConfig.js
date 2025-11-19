// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-FcWaVOSc4poBMGU6-QNisp3RVxMRods",
  authDomain: "crud-actividad-usc.firebaseapp.com",
  projectId: "crud-actividad-usc",
  storageBucket: "crud-actividad-usc.firebasestorage.app",
  messagingSenderId: "606599563856",
  appId: "1:606599563856:web:27025f647cb98c4674df55",
  measurementId: "G-82SGQP56YT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
