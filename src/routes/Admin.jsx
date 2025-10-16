// src/routes/Admin.jsx
// Panel admin con edición por modal en Clientes / Productos / Pedidos.
// Incluye: stock en productos, sync desde Sheet/CSV y agrupación de pedidos por estado.

import { useMemo, useState, useEffect } from "react"
import useCollection from "../hooks/useCollection.js"
import { formatARS } from "../utils/currency.js"
import {
  db, doc, setDoc, getDoc, updateDoc, serverTimestamp,
  collection, getDocs
} from "../utils/firebase.js"
import { firebaseApiKey } from "../utils/firebase.js"

/* ===================== UI helpers ===================== */
function Section({ title, right, children }) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">{title}</h2>
        {right}
      </div>
      <div className="rounded-xl2 border border-surface-hard bg-white p-4">
        {children}
      </div>
    </section>
  )
}
function Badge({ children, color = "neutral" }) {
  const map = {
    neutral: "bg-neutral-100 text-neutral-700 border-neutral-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
  }
  return (
    <span className={`inline-block text-xs px-2 py-0.5 rounded-full border ${map[color] || map.neutral}`}>
      {children}
    </span>
  )
}
function Toolbar({ children }) {
  return <div className="flex flex-wrap items-center gap-2 mb-3">{children}</div>
}

// Modal simple reutilizable
function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/25" onClick={onClose} />
      <div className="absolute inset-0 grid place-items-center p-4">
        <div className="w-full max-w-2xl rounded-2xl bg-white border border-surface-hard shadow-xl">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">{title}</h3>
            <button onClick={onClose} className="text-sm text-neutral-600">Cerrar</button>
          </div>
          <div className="p-5">{children}</div>
          {footer && <div className="px-5 py-3 border-t bg-surface-soft rounded-b-2xl">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

/* ===========================================================
   CLIENTES
=========================================================== */
function Clients() {
  const { items, loading, error, create, remove } = useCollection("clients", { sortBy: "createdAt", fallback: [] })
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", address: "" })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState("")
  const [q, setQ] = useState("")

  // estado de edición (modal)
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", address: "" })
  useEffect(() => {
    if (editItem) setEditForm({
      name: editItem.name || "",
      email: editItem.email || "",
      phone: editItem.phone || "",
      address: editItem.address || ""
    })
  }, [editItem])

  async function saveEditClient() {
    if (!editItem) return
    await updateDoc(doc(db, "clients", editItem.id), {
      name: editForm.name.trim(),
      email: editForm.email.trim().toLowerCase(),
      phone: editForm.phone.trim(),
      address: editForm.address.trim(),
      updatedAt: new Date(),
    })
    // espejo en users si tenemos uid
    if (editItem.uid) {
      await updateDoc(doc(db, "users", editItem.uid), {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        phone: editForm.phone.trim(),
        address: editForm.address.trim(),
        updatedAt: new Date(),
      })
    }
    setEditOpen(false)
  }

  // crear user en Auth por REST (no cierra tu sesión)
  async function createAuthUser(email, password) {
    if (!firebaseApiKey) throw new Error("Falta firebaseApiKey en utils/firebase.js")
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
    setBusy(true); setMsg("")
    try {
      const name = form.name.trim()
      const email = form.email.trim().toLowerCase()
      const password = form.password
      const phone = form.phone.trim()
      const address = form.address.trim()
      if (!name || !email || !password) throw new Error("Nombre, email y contraseña son obligatorios")

      const uid = await createAuthUser(email, password)

      await setDoc(doc(db, "users", uid), {
        role: "cliente",
        name, email, phone, address,
        createdAt: serverTimestamp(),
      })

      await create({ uid, name, email, phone, address, createdAt: new Date() })
      setMsg("Cliente creado y habilitado para ingresar.")
      setForm({ name: "", email: "", password: "", phone: "", address: "" })
    } catch (err) {
      setMsg(err.message || "Error al crear cliente")
    } finally {
      setBusy(false)
    }
  }

  const filtered = useMemo(() => {
    const x = q.trim().toLowerCase()
    if (!x) return items
    return items.filter(c =>
      (c.name||"").toLowerCase().includes(x) ||
      (c.email||"").toLowerCase().includes(x) ||
      (c.phone||"").toLowerCase().includes(x)
    )
  }, [items, q])

  return (
    <>
      <Toolbar>
        <input
          className="w-full md:w-72 border border-surface-hard rounded-xl2 px-3 py-2"
          placeholder="Buscar cliente por nombre, email o teléfono"
          value={q} onChange={e=>setQ(e.target.value)}
        />
      </Toolbar>

      <Section title="Alta rápida de cliente" right={<Badge color="blue">Rol asignado: cliente</Badge>}>
        <form onSubmit={onSubmit} className="grid md:grid-cols-5 gap-2">
          <input className="border rounded-xl2 px-3 py-2" placeholder="Nombre"
                 value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} required />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Email" type="email"
                 value={form.email} onChange={e=>setForm(v=>({...v,email:e.target.value}))} required />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Contraseña" type="password"
                 value={form.password} onChange={e=>setForm(v=>({...v,password:e.target.value}))} required />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Teléfono"
                 value={form.phone} onChange={e=>setForm(v=>({...v,phone:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Dirección"
                 value={form.address} onChange={e=>setForm(v=>({...v,address:e.target.value}))} />
          <div className="md:col-span-5 flex items-center gap-3">
            <button disabled={busy} className="px-4 py-2 rounded-xl2 bg-brand text-white">
              {busy ? "Creando..." : "Agregar"}
            </button>
            {msg && <span className="text-sm">{msg}</span>}
          </div>
        </form>
      </Section>

      <Section title="Listado de clientes">
        {loading ? "Cargando..." : error ? <p className="text-red-600">{error}</p> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left"><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Dirección</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="py-2">{c.name}</td>
                    <td className="py-2">{c.email}</td>
                    <td className="py-2">{c.phone}</td>
                    <td className="py-2">{c.address}</td>
                    <td className="py-2 text-right space-x-3">
                      <button className="text-brand-dark" onClick={() => { setEditItem(c); setEditOpen(true) }}>Editar</button>
                      <button className="text-red-600" onClick={() => remove(c.id)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="py-4 text-neutral-600">Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Modal edición cliente */}
      <Modal
        open={editOpen}
        title="Editar cliente"
        onClose={()=>setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded-xl2 border" onClick={()=>setEditOpen(false)}>Cancelar</button>
            <button className="px-4 py-2 rounded-xl2 bg-brand text-white" onClick={saveEditClient}>Guardar</button>
          </div>
        }
      >
        <div className="grid md:grid-cols-2 gap-2">
          <input className="border rounded-xl2 px-3 py-2" placeholder="Nombre"
                 value={editForm.name} onChange={e=>setEditForm(v=>({...v,name:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Email"
                 value={editForm.email} onChange={e=>setEditForm(v=>({...v,email:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Teléfono"
                 value={editForm.phone} onChange={e=>setEditForm(v=>({...v,phone:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Dirección"
                 value={editForm.address} onChange={e=>setEditForm(v=>({...v,address:e.target.value}))} />
        </div>
      </Modal>
    </>
  )
}

/* ===========================================================
   PRODUCTOS (incluye STOCK y modal de edición)
=========================================================== */
function Products() {
  const { items, loading, error, create, remove } = useCollection("products", { sortBy: "name", desc: false, fallback: [] })
  const [form, setForm] = useState({ id: "", name: "", price: "", category: "", img: "", description: "", stock: "" })
  const [msg, setMsg] = useState("")
  const [busy, setBusy] = useState(false)
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("todas")

  // modal de edición
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({})
  useEffect(() => { if (editItem) setEditForm({ ...editItem }) }, [editItem])

  // sincronización desde Sheet/CSV
  const [sheetUrl, setSheetUrl] = useState("")
  const [csvFile, setCsvFile] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMsg, setSyncMsg] = useState("")
  const [updateExisting, setUpdateExisting] = useState(false)

  function sanitizeId(s = "") { return s.trim().replace(/\//g, "-") }
  function slugify(s=''){ return s.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').slice(0,60) }
  function toNum(v){ const n = Number(String(v).replace(",", ".")); return Number.isFinite(n) ? n : null }

  const categories = useMemo(() => {
    const set = new Set()
    items.forEach(p => set.add((p.category||'').trim() || 'Sin categoría'))
    return Array.from(set).sort((a,b)=>a.localeCompare(b,'es'))
  }, [items])

  const filtered = useMemo(() => {
    const x = q.trim().toLowerCase()
    const arr = items.filter(p => {
      if (cat !== 'todas' && (p.category || 'Sin categoría') !== cat) return false
      if (!x) return true
      const hay = [
        p.name, p.description, p.brand, p.varietal, p.origin, p.sku, p.category
      ].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(x)
    })
    arr.sort((a,b)=> (a.name||'').localeCompare(b.name||'','es'))
    return arr
  }, [items, q, cat])

  function parseCSV(text) {
    const rows = []; let row = [], i = 0, field = '', inQuotes = false
    while (i < text.length) {
      const c = text[i]
      if (inQuotes) { if (c === '"'){ if(text[i+1]==='"'){field+='"';i+=2;continue} inQuotes=false;i++;continue } field+=c;i++;continue }
      if (c === '"'){ inQuotes=true;i++;continue }
      if (c === ','){ row.push(field); field=''; i++; continue }
      if (c === '\r'){ i++; continue }
      if (c === '\n'){ row.push(field); rows.push(row); row=[]; field=''; i++; continue }
      field += c; i++
    }
    row.push(field); rows.push(row)
    const headers = rows.shift()?.map(h => (h || '').trim()) || []
    return rows
      .filter(r => r.some(cell => String(cell).trim() !== ''))
      .map(r => { const obj = {}; headers.forEach((h, idx) => obj[h] = r[idx] !== undefined ? String(r[idx]).trim() : ''); return obj })
  }
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
    const stock = toNum(r.stock ?? r.Stock)
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
      stock: Number.isFinite(stock) ? stock : undefined,
      updatedAt: new Date()
    }
    Object.keys(data).forEach(k => { if (data[k] === null || data[k] === undefined) delete data[k] })
    return { docId, data }
  }
  async function fetchCSVFromSheet(url) {
    let u = url.trim()
    const m = u.match(/\/spreadsheets\/d\/([^/]+)\/.*(?:#gid=(\d+))?/)
    if (m && !u.includes('/export?format=csv')) {
      const id = m[1], gid = m[2] || '0'
      u = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=${gid}`
    }
    const res = await fetch(u); if (!res.ok) throw new Error('No se pudo descargar el CSV'); return await res.text()
  }
  async function syncFromCSVText(text) {
    const rows = parseCSV(text); if (!rows.length) throw new Error('CSV vacío')
    const existing = new Set(); try { const qs = await getDocs(collection(db, 'products')); qs.forEach(d => existing.add(d.id)) } catch {}
    let created = 0, updated = 0, skipped = 0, errors = 0
    for (const r of rows) {
      const norm = normalizeRow(r); if (!norm) { skipped++; continue }
      const { docId, data } = norm
      try {
        const ref = doc(db, 'products', docId)
        if (existing.has(docId)) { if (updateExisting) { await setDoc(ref, data, { merge: true }); updated++ } else skipped++ }
        else { await setDoc(ref, { ...data, createdAt: new Date() }); created++; existing.add(docId) }
      } catch { errors++ }
    }
    return { created, updated, skipped, errors, total: rows.length }
  }
  async function handleSync() {
    setSyncMsg(''); setSyncing(true)
    try {
      let csvText = ''
      if (csvFile) csvText = await csvFile.text()
      else if (sheetUrl.trim()) csvText = await fetchCSVFromSheet(sheetUrl)
      else throw new Error('Pegá la URL del Sheet (CSV) o subí un archivo .csv')
      const r = await syncFromCSVText(csvText)
      setSyncMsg(`OK. Total: ${r.total} · Creados: ${r.created} · Actualizados: ${r.updated} · Omitidos: ${r.skipped} · Errores: ${r.errors}`)
    } catch (e) { setSyncMsg(e?.message || 'Error en la sincronización') }
    finally { setSyncing(false) }
  }

  async function onSubmit(e) {
    e.preventDefault()
    setMsg(""); setBusy(true)
    try {
      const customId = sanitizeId(form.id)
      const data = {
        name: form.name,
        price: Number(form.price || 0),
        category: form.category || "",
        img: form.img || "",
        description: form.description?.trim() || "",
        stock: Number.isFinite(Number(form.stock)) ? Number(form.stock) : 0,
        createdAt: new Date()
      }
      if (customId) {
        const ref = doc(db, "products", customId)
        const snap = await getDoc(ref)
        if (snap.exists()) throw new Error("Ya existe un producto con ese ID")
        await setDoc(ref, data)
      } else {
        await create(data)
      }
      setMsg("Producto guardado.")
      setForm({ id: "", name: "", price: "", category: "", img: "", description: "", stock: "" })
    } catch (err) { setMsg(err?.message || "No se pudo guardar el producto") }
    finally { setBusy(false) }
  }

  async function saveEditProduct() {
    if (!editItem) return
    const patch = {
      name: (editForm.name||"").trim(),
      price: Number(editForm.price||0),
      category: (editForm.category||"").trim(),
      img: (editForm.img||"").trim(),
      description: (editForm.description||"").trim(),
      stock: Number.isFinite(Number(editForm.stock)) ? Number(editForm.stock) : 0,
      brand: (editForm.brand||"").trim(),
      varietal: (editForm.varietal||"").trim(),
      origin: (editForm.origin||"").trim(),
      sku: (editForm.sku||"").trim(),
      volumeMl: Number.isFinite(Number(editForm.volumeMl)) ? Number(editForm.volumeMl) : undefined,
      abv: Number.isFinite(Number(editForm.abv)) ? Number(editForm.abv) : undefined,
      caseUnits: Number.isFinite(Number(editForm.caseUnits)) ? Number(editForm.caseUnits) : undefined,
      updatedAt: new Date(),
    }
    Object.keys(patch).forEach(k => patch[k] === undefined && delete patch[k])
    await updateDoc(doc(db, "products", editItem.id), patch)
    setEditOpen(false)
  }

  return (
    <>
      {/* Sincronizar */}
      <Section title="Sincronizar desde Google Sheet / CSV" right={<Badge color="blue">Actualiza o crea productos</Badge>}>
        <div className="grid md:grid-cols-5 gap-2 items-end">
          <div className="md:col-span-3">
            <label className="text-sm text-neutral-600">URL del CSV/Sheet</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   placeholder="https://docs.google.com/spreadsheets/d/.../export?format=csv&gid=0"
                   value={sheetUrl} onChange={e=>setSheetUrl(e.target.value)} />
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
            <button onClick={handleSync} disabled={syncing} className="w-full px-4 py-2 rounded-xl2 bg-brand text-white">
              {syncing ? 'Sincronizando…' : 'Sincronizar'}
            </button>
          </div>
        </div>
        {syncMsg && <p className="text-sm mt-2">{syncMsg}</p>}
      </Section>

      {/* Filtros */}
      <Toolbar>
        <input className="w-full md:w-72 border rounded-xl2 px-3 py-2"
               placeholder="Buscar por nombre, descripción, marca…"
               value={q} onChange={e=>setQ(e.target.value)} />
        <select className="border rounded-xl2 px-3 py-2 bg-white"
                value={cat} onChange={e=>setCat(e.target.value)}>
          <option value="todas">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {msg && <span className="text-sm">{msg}</span>}
      </Toolbar>

      {/* Alta manual */}
      <Section title="Alta manual">
        <form onSubmit={onSubmit} className="grid md:grid-cols-6 gap-2 mb-2">
          <input className="border rounded-xl2 px-3 py-2" placeholder="ID (opcional)"
                 value={form.id} onChange={e=>setForm(v=>({...v,id:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Nombre" required
                 value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Precio" type="number" required
                 value={form.price} onChange={e=>setForm(v=>({...v,price:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Categoría"
                 value={form.category} onChange={e=>setForm(v=>({...v,category:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Imagen (URL)"
                 value={form.img} onChange={e=>setForm(v=>({...v,img:e.target.value}))} />
          <input className="border rounded-xl2 px-3 py-2" placeholder="Stock"
                 value={form.stock} onChange={e=>setForm(v=>({...v,stock:e.target.value}))} />
          <textarea className="md:col-span-6 border rounded-xl2 px-3 py-2 min-h-[80px]"
                    placeholder="Descripción"
                    value={form.description} onChange={e=>setForm(v=>({...v, description: e.target.value}))} />
          <button disabled={busy} className="md:col-span-2 px-4 py-2 rounded-xl2 bg-brand text-white">
            {busy ? "Guardando..." : "Agregar"}
          </button>
        </form>
      </Section>

      {/* Tabla */}
      <Section title="Listado de productos">
        {loading ? "Cargando..." : error ? <p className="text-red-600">{error}</p> : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th>Producto</th><th>Precio</th><th>Categoría</th><th>Stock</th><th>Imagen</th><th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const stock = Number.isFinite(Number(p.stock)) ? Number(p.stock) : 0
                  const stockColor = stock <= 0 ? "red" : stock <= 5 ? "amber" : "green"
                  return (
                    <tr key={p.id} className="border-t align-top">
                      <td className="py-2">
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-neutral-600 line-clamp-2">{p.description || "—"}</div>
                      </td>
                      <td className="py-2">{formatARS(Number(p.price || 0))}</td>
                      <td className="py-2">{p.category || "—"}</td>
                      <td className="py-2"><Badge color={stockColor}>{stock <= 0 ? "Sin stock" : `Stock: ${stock}`}</Badge></td>
                      <td className="py-2 max-w-[240px] truncate" title={p.img}>{p.img || "—"}</td>
                      <td className="py-2 text-right space-x-3">
                        <button className="text-brand-dark" onClick={()=>{ setEditItem(p); setEditOpen(true) }}>Editar</button>
                        <button className="text-red-600" onClick={() => remove(p.id)}>Eliminar</button>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="py-4 text-neutral-600">Sin resultados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Modal edición producto */}
      <Modal
        open={editOpen}
        title="Editar producto"
        onClose={()=>setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded-xl2 border" onClick={()=>setEditOpen(false)}>Cancelar</button>
            <button className="px-4 py-2 rounded-xl2 bg-brand text-white" onClick={saveEditProduct}>Guardar cambios</button>
          </div>
        }
      >
        {!editItem ? null : (
          <div className="grid md:grid-cols-2 gap-3">
            <input className="border rounded-xl2 px-3 py-2" placeholder="Nombre"
                   value={editForm.name||""} onChange={e=>setEditForm(v=>({...v,name:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Precio" type="number"
                   value={editForm.price??""} onChange={e=>setEditForm(v=>({...v,price:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Categoría"
                   value={editForm.category||""} onChange={e=>setEditForm(v=>({...v,category:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Stock"
                   value={editForm.stock??""} onChange={e=>setEditForm(v=>({...v,stock:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2 md:col-span-2" placeholder="Imagen (URL)"
                   value={editForm.img||""} onChange={e=>setEditForm(v=>({...v,img:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Marca"
                   value={editForm.brand||""} onChange={e=>setEditForm(v=>({...v,brand:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Varietal"
                   value={editForm.varietal||""} onChange={e=>setEditForm(v=>({...v,varietal:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Origen"
                   value={editForm.origin||""} onChange={e=>setEditForm(v=>({...v,origin:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="SKU"
                   value={editForm.sku||""} onChange={e=>setEditForm(v=>({...v,sku:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Volumen (ml)" type="number"
                   value={editForm.volumeMl??""} onChange={e=>setEditForm(v=>({...v,volumeMl:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="% Alcohol" type="number" step="0.1"
                   value={editForm.abv??""} onChange={e=>setEditForm(v=>({...v,abv:e.target.value}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Caja (u.)" type="number"
                   value={editForm.caseUnits??""} onChange={e=>setEditForm(v=>({...v,caseUnits:e.target.value}))} />
            <textarea className="border rounded-xl2 px-3 py-2 md:col-span-2 min-h-[90px]" placeholder="Descripción"
                      value={editForm.description||""} onChange={e=>setEditForm(v=>({...v,description:e.target.value}))} />
          </div>
        )}
      </Modal>
    </>
  )
}

/* ===========================================================
   PEDIDOS (agrupados: pedido / en_proceso / entregado + modal)
=========================================================== */
const ORDER_STATES = [
  { value: "pedido", label: "pedido", color: "blue" },
  { value: "en_proceso", label: "en proceso", color: "amber" },
  { value: "entregado", label: "entregado", color: "green" },
]

function Orders() {
  const { items, loading, error } = useCollection("orders", { sortBy: "createdAt", desc: true, fallback: [] })

  // modal de edición
  const [editOpen, setEditOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [editForm, setEditForm] = useState({ status: "pedido", note: "" })

  useEffect(() => {
    if (!editItem) return
    setEditForm({
      status: editItem.status || "pedido",
      note: editItem.note || "",
      buyer: {
        nombre: editItem?.buyer?.nombre || "",
        telefono: editItem?.buyer?.telefono || "",
        direccion: editItem?.buyer?.direccion || "",
      }
    })
  }, [editItem])

  function statusColor(s) {
    return ORDER_STATES.find(x => x.value === s)?.color || "blue"
  }

  function ts(createdAt) {
    // Normaliza a timestamp numérico para ordenar: Firestore Timestamp o Date/string
    if (createdAt?.seconds) return createdAt.seconds * 1000
    const d = new Date(createdAt)
    return Number.isNaN(d.getTime()) ? 0 : d.getTime()
  }

  // Agrupar por estado y ordenar cada grupo (más nuevos primero)
  const groups = useMemo(() => {
    const map = {
      pedido: [],
      en_proceso: [],
      entregado: []
    }
    items.forEach(o => {
      const s = (o.status || "pedido")
      const key = (s === "en_proceso" || s === "entregado") ? s : "pedido"
      map[key].push(o)
    })
    Object.keys(map).forEach(k => {
      map[k].sort((a, b) => ts(b.createdAt) - ts(a.createdAt))
    })
    return map
  }, [items])

  async function saveEditOrder() {
    if (!editItem) return
    const patch = {
      status: editForm.status,
      note: (editForm.note||"").trim(),
      buyer: {
        nombre: editForm.buyer?.nombre || "",
        telefono: editForm.buyer?.telefono || "",
        direccion: editForm.buyer?.direccion || "",
      },
      updatedAt: new Date(),
    }
    await updateDoc(doc(db, 'orders', editItem.id), patch)
    setEditOpen(false)
  }

  const blocks = [
    { key: "pedido",     title: "Pedidos",     empty: "No hay pedidos pendientes." },
    { key: "en_proceso", title: "En proceso",  empty: "No hay pedidos en proceso." },
    { key: "entregado",  title: "Entregados",  empty: "No hay pedidos entregados." },
  ]

  return (
    <Section title="Pedidos">
      {loading ? "Cargando..." : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <div className="space-y-8">
          {blocks.map(b => (
            <div key={b.key}>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-lg font-semibold">{b.title}</h3>
                <span className="text-xs text-neutral-500">
                  ({groups[b.key].length})
                </span>
              </div>

              {groups[b.key].length === 0 ? (
                <div className="text-sm text-neutral-600">{b.empty}</div>
              ) : (
                <div className="space-y-3">
                  {groups[b.key].map(o => {
                    const total = Number(o.total || 0)
                    const fecha = o?.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000) : (o.createdAt || null)
                    const f = fecha ? fecha.toLocaleString() : '—'
                    const st = o.status || "pedido"
                    return (
                      <div key={o.id} className="border border-surface-hard rounded-xl2 p-3 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="font-semibold">Orden {o.id}</div>
                          <Badge color={statusColor(st)}>
                            {ORDER_STATES.find(x=>x.value===st)?.label || st}
                          </Badge>
                        </div>

                        <div className="text-sm text-neutral-700 mt-1">
                          Cliente: {o?.buyer?.nombre || '—'} · Tel: {o?.buyer?.telefono || '—'} · Fecha: {f}
                        </div>

                        <ul className="mt-2 text-sm list-disc pl-5">
                          {(o.items || []).map((it, i) => (
                            <li key={i}>{it.qty}× {it.name} — {formatARS(Number(it.price || 0))}</li>
                          ))}
                        </ul>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="font-bold">Total: {formatARS(total)}</div>
                          <div className="space-x-3">
                            <button
                              className="text-brand-dark"
                              onClick={()=>{ setEditItem(o); setEditOpen(true) }}
                            >
                              Editar
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal edición pedido */}
      <Modal
        open={editOpen}
        title="Editar pedido"
        onClose={()=>setEditOpen(false)}
        footer={
          <div className="flex justify-end gap-2">
            <button className="px-3 py-2 rounded-xl2 border" onClick={()=>setEditOpen(false)}>Cancelar</button>
            <button className="px-4 py-2 rounded-xl2 bg-brand text-white" onClick={saveEditOrder}>Guardar</button>
          </div>
        }
      >
        {!editItem ? null : (
          <div className="grid md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <label className="text-sm text-neutral-600">Estado</label>
              <select className="w-full border rounded-xl2 px-3 py-2 bg-white"
                      value={editForm.status}
                      onChange={e=>setEditForm(v=>({...v,status:e.target.value}))}>
                {ORDER_STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            <input className="border rounded-xl2 px-3 py-2" placeholder="Nombre"
                   value={editForm.buyer?.nombre||""}
                   onChange={e=>setEditForm(v=>({...v, buyer:{...v.buyer, nombre:e.target.value}}))} />
            <input className="border rounded-xl2 px-3 py-2" placeholder="Teléfono"
                   value={editForm.buyer?.telefono||""}
                   onChange={e=>setEditForm(v=>({...v, buyer:{...v.buyer, telefono:e.target.value}}))} />
            <input className="md:col-span-2 border rounded-xl2 px-3 py-2" placeholder="Dirección"
                   value={editForm.buyer?.direccion||""}
                   onChange={e=>setEditForm(v=>({...v, buyer:{...v.buyer, direccion:e.target.value}}))} />

            <textarea className="md:col-span-2 border rounded-xl2 px-3 py-2 min-h-[90px]" placeholder="Nota interna"
                      value={editForm.note||""}
                      onChange={e=>setEditForm(v=>({...v, note:e.target.value}))} />
          </div>
        )}
      </Modal>
    </Section>
  )
}

/* ===========================================================
   ADMIN (tabs)
=========================================================== */
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
