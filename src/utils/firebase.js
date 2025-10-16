// src/utils/firebase.js
// Firebase listo con Auth + Firestore + Storage usando tu config directa

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection, getDocs, addDoc, doc, getDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
  // 👇 agrego helpers para transacciones / batch / incrementos
  runTransaction, writeBatch, increment
} from 'firebase/firestore'
import {
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged
} from 'firebase/auth'
import {
  getStorage, ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject
} from 'firebase/storage'

// ⚠️ Tu configuración
const config = {
  apiKey: "AIzaSyCKqkM1QIb8mViWTFqcyqIzgO_0alg4CBc",
  authDomain: "distrimax-c06b7.firebaseapp.com",
  projectId: "distrimax-c06b7",
  storageBucket: "distrimax-c06b7.firebasestorage.app", // si da errores, probá con: "distrimax-c06b7.appspot.com"
  messagingSenderId: "73229978791",
  appId: "1:73229978791:web:91a6f145bc1da26785df82"
}

let app, db, auth, storage
let enabled = false

try {
  app = initializeApp(config)
  db = getFirestore(app)
  auth = getAuth(app)
  storage = getStorage(app)
  enabled = true
} catch (e) {
  console.warn('Firebase deshabilitado:', e?.message || e)
}

export const isFirebaseEnabled = () => enabled
export const isAuthEnabled = () => !!auth
export const firebaseApiKey = config.apiKey

// Exports agrupados para que puedas importar desde cualquier parte
export {
  // Core
  db, auth, storage,

  // Firestore
  collection, getDocs, addDoc, doc, getDoc, setDoc,
  updateDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp,
  // 👇 nuevos helpers de Firestore que vamos a usar en Checkout
  runTransaction, writeBatch, increment,

  // Auth
  signInWithEmailAndPassword, signOut, onAuthStateChanged,

  // Storage
  storageRef, uploadBytesResumable, getDownloadURL, deleteObject
}
