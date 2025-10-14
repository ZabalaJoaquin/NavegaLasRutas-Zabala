import { useState } from "react"
import useCollection from "../hooks/useCollection.js"
import { formatARS } from "../utils/currency.js"
import {
  db, doc, setDoc, serverTimestamp,
  // lo usamos en Products/Orders a través del hook useCollection
} from "../utils/firebase.js"
import { firebaseApiKey } from "../utils/firebase.js"

// UI helper
function Section({ title, children }) {
  return (
    <section className="mt-6">
      <h2 className="text-xl font-semibold mb-3">{title}</h2>
      <div className="rounded-xl2 border border-surface-hard bg-white/90 p-4">
        {children}
      </div>
    </section>
  )
}

/* -------------------- CLIENTES -------------------- */
function Clients() {
  const { items, loading, error, create, remove } = useCollection("clients", { sortBy: "createdAt", fallback: [] })
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  async function createAuthUser(email, password) {
    if (!firebaseApiKey) {
      throw new Error("Falta firebaseApiKey en utils/firebase.js (export const firebaseApiKey = config.apiKey)")
    }
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    })
    const data = await res.json()
    if (!res.ok) {
      const code = data?.error?.message || "UNKNOWN"
      let human = "No se pudo crear el usuario"
      if (code === "EMAIL_EXISTS") human = "Ese email ya está registrado"
      if (code.includes("WEAK_PASSWORD")) human = "La contraseña debe tener 6+ caracteres"
      throw new Error(human)
    }
    return data.localId // UID
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg("")
    try {
      const name = form.name.trim()
      const email = form.email.trim().toLowerCase()
      const password = form.password
      const phone = form.phone.trim()
      const address = form.address.trim()

      if (!name || !email || !password) throw new Error("Nombre, email y contraseña son obligatorios")

      // 1) Crear usuario en Firebase Auth SIN romper tu sesión (REST)
      const uid = await createAuthUser(email, password)

      // 2) Guardar perfil/rol en users/{uid}
      await setDoc(doc(db, "users", uid), {
        role: "cliente",
        name, email, phone, address,
        createdAt: serverTimestamp(),
      })

      // 3) Guardar fila visible en "clients"
      await create({ uid, name, email, phone, address, createdAt: new Date() })

      setMsg("Cliente creado y habilitado para ingresar.")
      setForm({ name: "", email: "", password: "", phone: "", address: "" })
    } catch (err) {
      setMsg(err.message || "Error al crear cliente")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Section title="Clientes">
      <form onSubmit={onSubmit} className="grid md:grid-cols-5 gap-2 mb-4">
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Nombre"
               value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} required />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Email" type="email"
               value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} required />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Contraseña" type="password"
               value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))} required />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Teléfono"
               value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Dirección"
               value={form.address} onChange={e=>setForm(v=>({...v,address:e.target.value}))} />
        <button disabled={busy} className="col-span-full md:col-span-1 px-4 py-2 rounded-xl2 bg-brand text-white">
          {busy ? "Creando..." : "Agregar"}
        </button>
      </form>

      {msg && <p className="text-sm">{msg}</p>}

      {loading ? "Cargando..." : error ? <p className="text-red-600">{error}</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Nombre</th><th>Email</th><th>Teléfono</th><th>Dirección</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(c => (
                <tr key={c.id} className="border-t">
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td className="text-right">
                    <button className="text-red-600" onClick={() => remove(c.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-neutral-600 mt-2">
        Nota: la contraseña no se guarda en Firestore; sólo se usa para crear la cuenta en Authentication.
      </p>
    </Section>
  )
}

/* -------------------- PRODUCTOS -------------------- */
function Products() {
  const { items, loading, error, create, remove } = useCollection("products", { sortBy: "name", desc: false, fallback: [] })
  const [form, setForm] = useState({ id: "", name: "", price: "", category: "", img: "" })

  async function onSubmit(e) {
    e.preventDefault()
    await create({ ...form, price: Number(form.price || 0) })
    setForm({ id: "", name: "", price: "", category: "", img: "" })
  }

  return (
    <Section title="Productos">
      <form onSubmit={onSubmit} className="grid md:grid-cols-5 gap-2 mb-4">
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="ID (opcional)"
               value={form.id} onChange={e=>setForm(v=>({...v,id:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Nombre" required
               value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Precio" type="number" required
               value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Categoría"
               value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Imagen (/prod/...)"
               value={form.img} onChange={e=>setForm(v=>({...v,img:e.target.value}))} />
        <button className="col-span-full md:col-span-1 px-4 py-2 rounded-xl2 bg-brand text-white">Agregar</button>
      </form>

      {loading ? "Cargando..." : error ? <p className="text-red-600">{error}</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left"><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Imagen</th><th></th></tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t">
                  <td>{p.name}</td>
                  <td>{formatARS(Number(p.price || 0))}</td>
                  <td>{p.category}</td>
                  <td className="max-w-[240px] truncate">{p.img}</td>
                  <td className="text-right">
                    <button className="text-red-600" onClick={() => remove(p.id)}>Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  )
}

/* -------------------- PEDIDOS -------------------- */
function Orders() {
  const { items, loading, error } = useCollection("orders", { sortBy: "createdAt", desc: true, fallback: [] })
  return (
    <Section title="Pedidos">
      {loading ? "Cargando..." : error ? <p className="text-red-600">{error}</p> : (
        <div className="space-y-3">
          {items.map(o => (
            <div key={o.id} className="border border-surface-hard rounded-xl2 p-3 bg-white">
              <div className="font-semibold">Orden {o.id}</div>
              <div className="text-sm text-neutral-700">Cliente: {o?.buyer?.nombre} · Tel: {o?.buyer?.telefono}</div>
              <ul className="mt-2 text-sm list-disc pl-5">
                {(o.items || []).map((it, i) => (
                  <li key={i}>{it.qty}x {it.name} — ${Number(it.price || 0)}</li>
                ))}
              </ul>
              <div className="mt-2 font-bold">Total: ${Number(o.total || 0)}</div>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

/* -------------------- ADMIN (DEFAULT EXPORT) -------------------- */
export default function Admin() {
  const [tab, setTab] = useState("clients")
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      <div className="flex gap-2 mb-4">
        <button onClick={()=>setTab("clients")}
                className={"px-4 py-2 rounded-xl2 border " + (tab==="clients"?"bg-brand text-white border-brand":"border-surface-hard")}>
          Clientes
        </button>
        <button onClick={()=>setTab("products")}
                className={"px-4 py-2 rounded-xl2 border " + (tab==="products"?"bg-brand text-white border-brand":"border-surface-hard")}>
          Productos
        </button>
        <button onClick={()=>setTab("orders")}
                className={"px-4 py-2 rounded-xl2 border " + (tab==="orders"?"bg-brand text-white border-brand":"border-surface-hard")}>
          Pedidos
        </button>
      </div>

      {tab === "clients" && <Clients />}
      {tab === "products" && <Products />}
      {tab === "orders" && <Orders />}
    </section>
  )
}
