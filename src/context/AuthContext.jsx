// src/auth/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import {
  isAuthEnabled, auth, onAuthStateChanged, signInWithEmailAndPassword, signOut,
  db, doc, getDoc
} from "../utils/firebase.js";

const AuthCtx = createContext(null);

// Fallback por email (para no quedarte bloqueado si las rules fallan)
// Podés agregar más correos si querés.
const ADMIN_EMAILS = ["distrimax.alvear@gmail.com"];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("dmx.user") || "null"); } catch { return null; }
  });

  useEffect(() => {
    if (!isAuthEnabled()) return;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        localStorage.removeItem("dmx.user");
        return;
      }

      let role = "cliente";
      try {
        // Lee rol desde Firestore: users/{uid}
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && typeof snap.data().role === "string") {
          role = snap.data().role;
        } else if (ADMIN_EMAILS.includes(fbUser.email ?? "")) {
          role = "admin"; // fallback para no quedar bloqueado
        }
      } catch (e) {
        console.warn("No pude leer users/{uid}:", e?.message || e);
        if (ADMIN_EMAILS.includes(fbUser.email ?? "")) role = "admin";
      }

      const u = {
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName || (fbUser.email?.split("@")[0] ?? "Usuario"),
        role
      };
      setUser(u);
      localStorage.setItem("dmx.user", JSON.stringify(u));
    });

    return () => unsub();
  }, []);

  const login = async ({ email, password }) => {
    try { await signInWithEmailAndPassword(auth, email, password); return { ok: true }; }
    catch (e) { return { ok: false, error: e?.message || "No se pudo iniciar sesión" }; }
  };

  const logout = async () => {
    try { await signOut(auth); } catch {}
    setUser(null);
    localStorage.removeItem("dmx.user");
  };

  const value = { user, login, logout, isAdmin: user?.role === "admin" };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
