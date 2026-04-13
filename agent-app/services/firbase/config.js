import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBiCsQZcA7TQVeXme6sSCW1itDdUtw0eiw",
  authDomain: "agentapp-b1103.firebaseapp.com",
  projectId: "agentapp-b1103",
  storageBucket: "agentapp-b1103.firebasestorage.app",
  messagingSenderId: "265420681266",
  appId: "1:265420681266:web:c7e795badb8ae3cd4b0c2b",
};

const app = initializeApp(firebaseConfig);

// Use initializeAuth with AsyncStorage persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

const db = getFirestore(app);

export { auth, db };