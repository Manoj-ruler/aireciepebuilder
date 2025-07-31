// Simple and reliable Firebase initialization
import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: "AIzaSyANWmbHksMxooKS2ficFoSRuv3_q6zcIts",
  authDomain: "zanithai.firebaseapp.com",
  projectId: "zanithai",
  storageBucket: "zanithai.firebasestorage.app",
  messagingSenderId: "923141948299",
  appId: "1:923141948299:web:0c1f7f0bebf21261f2258e",
  measurementId: "G-0HGWW1CEWD",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Export auth functions
export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth"

// Export Firestore functions
export {
  collection,
  doc,
  addDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore"

export default app
