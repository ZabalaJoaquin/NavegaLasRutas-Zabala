import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { adminCreateUser, adminSetUserRole } from "../services/admin";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function AdminUsers() {
  const { isAdmin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("customer");
  const [message, setMessage] = useState("");

  if (!isAdmin) return <p className="container">No autorizado.</p>;

  const onCreate = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const uid = await adminCreateUser({ email, password, role, displayName });
      setMessage(`Usuario creado: ${uid}`);
      setEmail(""); setPassword(""); setDisplayName(""); setRole("customer");
    } catch (e) { setMessage(e.message); }
  };

  const onCheck = async () => {
    const id = prompt("UID a consultar:");
    if (!id) return;
    const snap = await getDoc(doc(db, "users", id));
    setMessage(snap.exists() ? JSON.stringify(snap.data()) : "No existe");
  };

  const onRole = async () => {
    const id = prompt("UID a cambiar rol:");
    if (!id) return;
    const r = prompt("Nuevo rol (admin|seller|customer):", "customer");
    if (!r) return;
    await adminSetUserRole(id, r);
    setMessage(`Rol cambiado a ${r}`);
  };

  return (
    <section className="container" style={{ maxWidth: 520 }}>
      <h1>Usuarios</h1>
      <form onSubmit={onCreate} className="card" style={{ display:"grid", gap: 8 }}>
        <label>Nombre
          <input value={displayName} onChange={e=>setDisplayName(e.target.value)} />
        </label>
        <label>Email
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </label>
        <label>Contraseña
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
        <label>Rol
          <select value={role} onChange={e=>setRole(e.target.value)}>
            <option value="customer">Cliente</option>
            <option value="seller">Vendedor</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="row" style={{ gap: 8 }}>
          <button type="submit" className="btn btn-primary">Crear usuario</button>
          <button type="button" className="btn" onClick={onCheck}>Ver usuario</button>
          <button type="button" className="btn" onClick={onRole}>Cambiar rol</button>
        </div>
        {message && <p>{message}</p>}
      </form>
    </section>
  );
}
