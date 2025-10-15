import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Login(){
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e){
    e.preventDefault();
    const res = await login({ email, password });
    if (res.ok) nav("/");
    else setError(res.error || "Error de ingreso");
  }

  return (
    <section className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Ingresar</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Contraseña" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button className="w-full mt-1 px-4 py-2 rounded-xl2 bg-brand text-white font-semibold">Entrar</button>
        {/* <p className="text-xs text-neutral-600">Demo: <b>distrimax.alvear@gmail.com / admin123</b> (admin) o <b>cliente@distrimax / cliente123</b></p> */}
      </form>
    </section>
  )
}
