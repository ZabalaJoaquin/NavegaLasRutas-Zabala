// src/routes/Admin.jsx
import { useState } from "react"
import useCollection from "../hooks/useCollection.js"
import { formatARS } from "../utils/currency.js"
import {
  db, doc, setDoc, getDoc, serverTimestamp,
  collection, getDocs
} from "../utils/firebase.js"
import { firebaseApiKey } from "../utils/firebase.js"

// Componente cajita visual para secciones del admin
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

/* ==================== CLIENTES ==================== */
// Nota: crea user en Authentication (REST) + documento en /users con rol "cliente" + fila visible en /clients
function Clients() {
  const { items, loading, error, create, remove } = useCollection("clients", { sortBy: "createdAt", fallback: [] })
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")

  // Crea usuario en Firebase Auth usando REST (esto no te desloguea)
  async function createAuthUser(email, password) {
    if (!firebaseApiKey) throw new Error("Falta firebaseApiKey en utils/firebase.js (export const firebaseApiKey = config.apiKey)")
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
    return data.localId // UID de Auth
  }

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setMsg("")
    try {
      // Saco valores y valido mínimos
      const name = form.name.trim()
      const email = form.email.trim().toLowerCase()
      const password = form.password
      const phone = form.phone.trim()
      const address = form.address.trim()
      if (!name || !email || !password) throw new Error("Nombre, email y contraseña son obligatorios")

      // 1) Auth
      const uid = await createAuthUser(email, password)
      // 2) Perfil + rol
      await setDoc(doc(db, "users", uid), {
        role: "cliente",
        name, email, phone, address,
        createdAt: serverTimestamp(),
      })
      // 3) Fila visible en /clients (para listar desde admin)
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

/* ==================== PRODUCTOS ==================== */
/*
  Mejoras:
  - Agrego campo "stock" en el alta manual (número, >= 0).
  - Muestro "stock" en la tabla.
  - Sincronización CSV/Sheet ahora soporta columna "stock".
  - Si completás "ID", se usa como doc.id (y valida que no exista).
*/
function Products() {
  const { items, loading, error, create, remove } = useCollection("products", { sortBy: "name", desc: false, fallback: [] })
  const [form, setForm] = useState({ id: "", name: "", price: "", category: "", img: "", description: "", stock: "" })
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)

  // --- Sincronización desde Sheet/CSV ---
  const [sheetUrl, setSheetUrl] = useState("")
  const [csvFile, setCsvFile] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")
  const [updateExisting, setUpdateExisting] = useState(false)

  // Helpers chiquitos para normalizar
  function sanitizeId(s = "") { return s.trim().replace(/\//g, "-") }
  function slugify(s='') {
    return s.toLowerCase().trim()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
      .replace(/-+/g,'-').slice(0,60)
  }
  function toNum(v) {
    const n = Number(String(v ?? '').toString().replace(",", "."))
    return Number.isFinite(n) ? n : null
  }

  // Parser CSV simple (soporta comillas)
  function parseCSV(text) {
    const rows = []
    let row = []
    let i = 0, field = '', inQuotes = false

    while (i < text.length) {
      const c = text[i]
      if (inQuotes) {
        if (c === '"') {
          if (text[i+1] === '"') { field += '"'; i += 2; continue }
          inQuotes = false; i++; continue
        } else { field += c; i++; continue }
      } else {
        if (c === '"') { inQuotes = true; i++; continue }
        if (c === ',') { row.push(field); field = ''; i++; continue }
        if (c === '\r') { i++; continue }
        if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue }
        field += c; i++
      }
    }
    row.push(field); rows.push(row)

    const headers = rows.shift()?.map(h => (h || '').trim()) || []
    return rows
      .filter(r => r.some(cell => String(cell).trim() !== ''))
      .map(r => {
        const obj = {}
        headers.forEach((h, idx) => { obj[h] = r[idx] !== undefined ? String(r[idx]).trim() : '' })
        return obj
      })
  }

  // Mapea una fila del CSV al schema que usamos
  function normalizeRow(r) {
    const id = sanitizeId(r.id || r.ID || r.Id || '')
    const name = r.name || r.Nombre || r.NOMBRE || ''
    const price = toNum(r.price ?? r.Precio ?? r.PRECIO)
    const category = r.category || r.Categoria || r.Categoría || ''
    const img = r.img || r.imagen || r.image || ''
    const description = (r.description || r.Descripcion || r.Descripción || '').trim()
    const brand = r.brand || r.Marca || ''
    const varietal = r.varietal || ''
    const origin = r.origin || r.Origen || ''
    const volumeMl = toNum(r.volumeMl ?? r.volumenMl ?? r.ml ?? r.Volumen)
    const abv = toNum(r.abv ?? r.alcohol ?? r.Alcohol)
    const caseUnits = toNum(r.caseUnits ?? r.caja ?? r.Caja)
    const sku = r.sku || r.SKU || ''
    const stock = toNum(r.stock ?? r.Stock ?? r.STOCK) // ← NUEVO: soporte stock desde sheet

    const docId = id || (name ? slugify(name) : '')
    if (!docId) return null

    const data = {
      name: name || 'Producto',
      price: Number(price ?? 0),
      category, img, description,
      brand, varietal, origin,
      volumeMl: volumeMl ?? null,
      abv: abv ?? null,
      caseUnits: caseUnits ?? null,
      sku: sku || '',
      stock: Number.isFinite(stock) ? stock : null, // si no vino, queda null (sin límite)
      updatedAt: new Date()
    }
    // limpio null/undefined
    Object.keys(data).forEach(k => { if (data[k] === null || data[k] === undefined) delete data[k] })
    return { docId, data }
  }

  async function fetchCSVFromSheet(url) {
    // acepta link “edit#gid” y lo transforma a export csv
    try {
      let u = url.trim()
      const editMatch = u.match(/\/spreadsheets\/d\/([^/]+)\/.*(?:#gid=(\d+))?/)
      if (editMatch && !u.includes('/export?format=csv')) {
        const id = editMatch[1]
        const gid = editMatch[2] || '0'
        u = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
      }
      const res = await fetch(u)
      if (!res.ok) throw new Error('No se pudo descargar el CSV (revisá el enlace y que sea público)')
      return await res.text()
    } catch (e) {
      throw new Error(e?.message || 'Error al descargar CSV')
    }
  }

  async function syncFromCSVText(text) {
    const rows = parseCSV(text)
    if (!rows.length) throw new Error('CSV vacío o sin filas de datos')

    // traigo IDs existentes para decidir crear/actualizar
    const existing = new Set()
    try {
      const qs = await getDocs(collection(db, 'products'))
      qs.forEach(d => existing.add(d.id))
    } catch { /* si falla, seguimos igual */ }

    let created = 0, updated = 0, skipped = 0, errors = 0
    for (const r of rows) {
      const norm = normalizeRow(r)
      if (!norm) { skipped++; continue }
      const { docId, data } = norm
      try {
        const ref = doc(db, 'products', docId)
        if (existing.has(docId)) {
          if (updateExisting) {
            await setDoc(ref, data, { merge: true })
            updated++
          } else {
            skipped++
          }
        } else {
          await setDoc(ref, { ...data, createdAt: new Date() })
          created++
          existing.add(docId)
        }
      } catch {
        errors++
      }
    }
    return { created, updated, skipped, errors, total: rows.length }
  }

  async function handleSync() {
    setSyncMsg('')
    setSyncing(true)
    try {
      let csvText = ''
      if (csvFile) {
        csvText = await csvFile.text()
      } else if (sheetUrl.trim()) {
        csvText = await fetchCSVFromSheet(sheetUrl)
      } else {
        throw new Error('Pegá la URL del Sheet (CSV) o subí un archivo .csv')
      }
      const res = await syncFromCSVText(csvText)
      setSyncMsg(`OK. Total: ${res.total} · Creados: ${res.created} · Actualizados: ${res.updated} · Omitidos: ${res.skipped} · Errores: ${res.errors}`)
    } catch (e) {
      setSyncMsg(e?.message || 'Error en la sincronización')
    } finally {
      setSyncing(false)
    }
  }

  // Alta manual de un producto (usa tu ID como doc.id si lo completás)
  async function onSubmit(e) {
    e.preventDefault()
    setMsg("")
    setBusy(true)
    try {
      const customId = sanitizeId(form.id)
      const priceNum = Number(form.price || 0)
      const stockNum = form.stock === "" ? null : Number(form.stock)

      if (!form.name.trim()) throw new Error("El nombre es obligatorio")
      if (!Number.isFinite(priceNum) || priceNum < 0) throw new Error("El precio debe ser un número válido")
      if (stockNum !== null && (!Number.isFinite(stockNum) || stockNum < 0)) {
        throw new Error("El stock debe ser 0 o un número positivo")
      }

      const data = {
        name: form.name.trim(),
        price: priceNum,
        category: form.category || "",
        img: form.img || "",
        description: (form.description || "").trim(),
        stock: stockNum ?? null,           // null = sin límite
        createdAt: new Date()
      }

      if (customId) {
        const ref = doc(db, "products", customId)
        const snap = await getDoc(ref)
        if (snap.exists()) throw new Error("Ya existe un producto con ese ID")
        await setDoc(ref, data)
      } else {
        // usa el create del hook (auto-id)
        await useCollectionCreateFallback(create, data)
      }

      setMsg("Producto guardado.")
      setForm({ id: "", name: "", price: "", category: "", img: "", description: "", stock: "" })
    } catch (err) {
      setMsg(err?.message || "No se pudo guardar el producto")
    } finally {
      setBusy(false)
    }
  }

  // Helper por si tu hook create espera sí o sí createdAt propio
  async function useCollectionCreateFallback(create, data) {
    // el hook ya agrega createdAt? si no, este data ya lo trae
    await create(data)
  }

  return (
    <Section title="Productos">
      {/* Sincronizar Sheet/CSV */}
      <div className="mb-5 rounded-xl2 border border-surface-hard bg-white p-3">
        <div className="grid md:grid-cols-5 gap-2 items-end">
          <div className="md:col-span-3">
            <label className="text-sm text-neutral-600">URL del CSV/Sheet</label>
            <input
              className="w-full border border-surface-hard rounded-xl2 px-3 py-2"
              placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0"
              value={sheetUrl}
              onChange={e=>setSheetUrl(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-neutral-600">o subir .csv</label>
            <input type="file" accept=".csv,text/csv" onChange={e=>setCsvFile(e.target.files?.[0]||null)} />
          </div>
          <div className="flex items-center gap-2">
            <input id="upd-exist" type="checkbox" checked={updateExisting} onChange={e=>setUpdateExisting(e.target.checked)} />
            <label htmlFor="upd-exist" className="text-sm">Actualizar existentes</label>
          </div>
          <div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full px-4 py-2 rounded-xl2 bg-brand text-white"
            >
              {syncing ? 'Sincronizando…' : 'Sincronizar'}
            </button>
          </div>
        </div>
        {syncMsg && <p className="text-sm mt-2">{syncMsg}</p>}
        <p className="text-xs text-neutral-600 mt-1">
          Columnas sugeridas: <code>id</code>, <code>name</code>, <code>price</code>, <code>category</code>,
          <code>img</code>, <code>description</code>, <code>brand</code>, <code>varietal</code>, <code>origin</code>,
          <code>volumeMl</code>, <code>abv</code>, <code>caseUnits</code>, <code>sku</code>, <code>stock</code>.
        </p>
      </div>

      {/* Alta manual */}
      <form onSubmit={onSubmit} className="grid md:grid-cols-6 gap-2 mb-4">
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="ID (si lo ponés se usa como doc.id)"
               value={form.id} onChange={e=>setForm(v=>({...v,id:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2 md:col-span-2" placeholder="Nombre" required
               value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Precio" type="number" required
               value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Categoría"
               value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))} />
        <input className="border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Stock (u.)"
               value={form.stock} onChange={e=>setForm(v=>({...v,stock:e.target.value}))} />

        <input className="border border-surface-hard rounded-xl2 px-3 py-2 md:col-span-3" placeholder="Imagen (URL)"
               value={form.img} onChange={e=>setForm(v=>({...v,img:e.target.value}))} />

        <textarea
          className="border border-surface-hard rounded-xl2 px-3 py-2 md:col-span-3 min-h-[72px]"
          placeholder="Descripción"
          value={form.description}
          onChange={e=>setForm(v=>({...v,description:e.target.value}))}
        />

        <button disabled={busy} className="col-span-full md:col-span-1 px-4 py-2 rounded-xl2 bg-brand text-white">
          {busy ? "Guardando..." : "Agregar"}
        </button>
        {msg && <div className="md:col-span-5 self-center text-sm">{msg}</div>}
      </form>

      {/* Tabla de productos */}
      {loading ? "Cargando..." : error ? <p className="text-red-600">{error}</p> : (
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th>Nombre</th><th>Precio</th><th>Categoría</th><th>Stock</th><th>Imagen</th><th></th>
              </tr>
            </thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t align-top">
                  <td className="py-2">{p.name}</td>
                  <td className="py-2">{formatARS(Number(p.price || 0))}</td>
                  <td className="py-2">{p.category || "-"}</td>
                  <td className="py-2">{(p.stock ?? "") === "" ? "-" : Number(p.stock)}</td>
                  <td className="py-2 max-w-[260px] truncate" title={p.img}>{p.img || "-"}</td>
                  <td className="py-2 text-right">
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

/* ==================== PEDIDOS ==================== */
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

/* ==================== ADMIN (DEFAULT) ==================== */
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
