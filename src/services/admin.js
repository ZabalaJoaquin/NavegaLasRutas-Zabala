import { firebaseConfig, db } from "../firebase/config";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function adminCreateUser({ email, password, role = "customer", displayName = "" }) {
  const secondary = initializeApp(firebaseConfig, "secondary");
  try {
    const sAuth = getAuth(secondary);
    const cred = await createUserWithEmailAndPassword(sAuth, email, password);
    const uid = cred.user.uid;
    await setDoc(doc(db, "users", uid), { role, displayName, email, createdAt: serverTimestamp() }, { merge: true });
    return uid;
  } finally {
    await deleteApp(secondary);
  }
}
export async function adminSetUserRole(uid, role) {
  await setDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() }, { merge: true });
}
