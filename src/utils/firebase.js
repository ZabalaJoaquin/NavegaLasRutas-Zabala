// src/utils/firebase.js
// Firebase listo con Auth + Firestore usando tu config directa (sin .env)

import { initializeApp } from 'firebase/app'
import { serverTimestamp } from 'firebase/firestore'
export { serverTimestamp }
import {
  getFirestore,
  collection, getDocs, addDoc, doc, getDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy
} from 'firebase/firestore'
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth'

// Tu configuración (copiada de Firebase)
const config = {
  apiKey: "AIzaSyCKqkM1QIb8mViWTFqcyqIzgO_0alg4CBc",
  authDomain: "distrimax-c06b7.firebaseapp.com",
  projectId: "distrimax-c06b7",
  storageBucket: "distrimax-c06b7.firebasestorage.app",
  messagingSenderId: "73229978791",
  appId: "1:73229978791:web:91a6f145bc1da26785df82"
  // Nota: si tuvieras problemas con Storage, probá con:
  // storageBucket: "distrimax-c06b7.appspot.com"
}

let app, db, auth
let enabled = false

try {
  app = initializeApp(config)
  db = getFirestore(app)
  auth = getAuth(app)
  enabled = true
} catch (e) {
  console.warn('Firebase deshabilitado:', e?.message || e)
}

export const isFirebaseEnabled = () => enabled
export const isAuthEnabled = () => !!auth
export const firebaseApiKey = config.apiKey

export {
  // core
  db, auth,
  // firestore
  collection, getDocs, addDoc, doc, getDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy,
  // auth
  signInWithEmailAndPassword, signOut, onAuthStateChanged
}
