import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBqpBug0FzPvND3tkht7SUx3gF9LbdkniE",
  authDomain: "alerta-vecina.firebaseapp.com",
  projectId: "alerta-vecina",
  storageBucket: "alerta-vecina.firebasestorage.app",
  messagingSenderId: "362886977865",
  appId: "1:362886977865:web:68c9d54a178e18b359e298"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);