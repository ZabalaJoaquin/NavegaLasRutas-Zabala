// src/routes/ProductDetail.jsx
import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  db, doc, getDoc, collection, getDocs, updateDoc,
  storage, storageRef, uploadBytesResumable, getDownloadURL
} from '../utils/firebase.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatARS } from '../utils/currency.js'
import QuantitySelector from '../components/QuantitySelector.jsx'
import ProductSpecs from '../components/ProductSpecs.jsx'
import RelatedProducts from '../components/RelatedProducts.jsx'

function slugify(s = '') {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-').slice(0, 60)
}

// compresión simple a WEBP si se sube archivo en el editor admin
async function compressToWebP(file, { maxWidth = 1200, quality = 0.85 } = {}) {
  const img = await new Promise((res, rej) => {
    const i = new Image()
    i.onload = () => res(i)
    i.onerror = rej
    i.src = URL.createObjectURL(file)
  })
  const scale = Math.min(1, maxWidth / (img.width || maxWidth))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round((img.width || maxWidth) * scale)
  canvas.height = Math.round((img.height || maxWidth) * scale)
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const blob = await new Promise(res => canvas.toBlob(res, 'image/webp', quality))
  return blob
}

export default function ProductDetail() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const isLogged = !!user
  const { addToCart } = useCart()

  const [product, setProduct] = useState(null)
  const [productDocId, setProductDocId] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [qty, setQty] = useState(1)
  const [justAdded, setJustAdded] = useState(false)

  // carga producto (Firestore -> por slug -> JSON local)
  useEffect(() => {
    window.scrollTo(0, 0)
    setNotFound(false)
    setProduct(null)
    setQty(1)
    setJustAdded(false)
    setProductDocId(null)

    ;(async () => {
      try {
        const snap = await getDoc(doc(db, 'products', id))
        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() })
          setProductDocId(snap.id)
          return
        }
        try {
          const qs = await getDocs(collection(db, 'products'))
          let found = null
          qs.forEach(d => {
            const data = d.data()
            if (d.id === id || slugify(data?.name || '') === id) {
              found = { id: d.id, ...data }
            }
          })
          if (found) {
            setProduct(found)
            setProductDocId(found.id)
            return
          }
        } catch {}
        const local = (await import('../data/products.json')).default
        const foundLocal =
          local.find(p => (p.id || '').toLowerCase() === id.toLowerCase()) ||
          local.find(p => slugify(p.name || '') === id.toLowerCase())
        if (foundLocal) {
          setProduct({ id: foundLocal.id || id, ...foundLocal })
          setProductDocId(null)
          return
        }
        setNotFound(true)
      } catch {
        setNotFound(true)
      }
    })()
  }, [id])

  const safe = useMemo(() => {
    if (!product) return null
    return {
      id: product.id || slugify(product.name || id),
      name: product.name || 'Producto',
      img: product.img || '',
      category: product.category || '',
      description: (product.description || '').trim(),
      price: Number(product.price ?? 0),
      brand: product.brand || '',
      varietal: product.varietal || '',
      origin: product.origin || '',
      volumeMl: product.volumeMl ?? product.volume ?? null,
      abv: product.abv ?? null,
      caseUnits: product.caseUnits ?? product.boxUnits ?? null,
      sku: product.sku || '',
      stock: Number(product.stock ?? Infinity)
    }
  }, [product, id])

  const price = useMemo(() => Number(safe?.price ?? 0), [safe])
  const outOfStock = useMemo(
    () => Number.isFinite(safe?.stock) && safe.stock <= 0,
    [safe]
  )

  if (notFound) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <Link to="/productos" className="px-4 py-2 rounded-xl2 bg-brand text-white">Volver a productos</Link>
      </section>
    )
  }

  if (!safe) {
    return <section className="max-w-6xl mx-auto px-4 py-10">Cargando...</section>
  }

  function handleAdd() {
    const n = Math.max(1, Number(qty || 1))
    addToCart(safe, n)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div>
          <img
            src={safe.img}
            alt={safe.name}
            className="w-full h-96 object-contain border rounded-xl2 bg-white"
            onError={(e) => { e.currentTarget.src = '/placeholder.png' }}
          />
          {safe.caseUnits && (
            <div className="mt-3 inline-block bg-amber-50 text-amber-800 text-sm px-3 py-1 rounded-xl2 border border-amber-200">
              Caja x {Number(safe.caseUnits)} unidades
            </div>
          )}
          {Number.isFinite(safe.stock) && (
            <div className="mt-2 text-sm text-neutral-600">
              Stock: {safe.stock > 0 ? safe.stock : 'sin stock'}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="text-3xl font-bold">{safe.name}</h1>
          {safe.brand && <div className="text-neutral-600 mt-1">{safe.brand}</div>}
          {safe.category && <div className="text-neutral-600">{safe.category}</div>}

          <p className="mt-4 text-neutral-800 whitespace-pre-line">
            {safe.description || 'Sin descripción.'}
          </p>

          <div className="mt-5">
            {isLogged ? (
              <div className="text-2xl font-extrabold text-brand-dark">{formatARS(price)}</div>
            ) : (
              <div className="text-neutral-500">Iniciá sesión para ver el precio</div>
            )}
          </div>

          {/* Acciones: oculto selector tras agregar */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {isLogged ? (
              outOfStock ? (
                <span className="text-red-600">Sin stock</span>
              ) : justAdded ? (
                <>
                  <span className="text-sm text-brand-dark font-semibold">¡Agregado al carrito! ✔</span>
                  <Link to="/carrito" className="px-5 py-2 rounded-xl2 bg-brand text-white font-semibold">
                    Ir al carrito
                  </Link>
                  <Link to="/productos" className="px-5 py-2 rounded-xl2 border border-surface-hard">
                    Seguir comprando
                  </Link>
                </>
              ) : (
                <>
                  <QuantitySelector
                    value={qty}
                    onChange={(v) => {
                      const n = Number(v || 1)
                      const max = Number.isFinite(safe.stock) ? safe.stock : Infinity
                      setQty(Math.max(1, Math.min(n, max)))
                    }}
                    min={1}
                    max={Number.isFinite(safe.stock) ? safe.stock : undefined}
                  />
                  <button
                    className="px-5 py-2 rounded-xl2 bg-brand text-white font-semibold"
                    onClick={handleAdd}
                    disabled={outOfStock || (Number.isFinite(safe.stock) && qty > safe.stock)}
                  >
                    Agregar al carrito
                  </button>
                </>
              )
            ) : (
              <Link to="/login" className="px-5 py-2 rounded-xl2 bg-brand text-white font-semibold">
                Ingresar para comprar
              </Link>
            )}
            <Link to="/productos" className="px-5 py-2 rounded-xl2 border border-surface-hard">
              Volver a productos
            </Link>
          </div>

          <div className="mt-6">
            <ProductSpecs product={safe} />
          </div>
        </div>
      </div>

      {/* Relacionados */}
      <RelatedProducts currentId={safe.id} category={safe.category} />

      {/* Editor inline (admin) */}
      {isAdmin && productDocId && (
        <AdminInlineEditor
          initial={safe}
          docId={productDocId}
          onUpdated={(updates) => setProduct(p => ({ ...(p || {}), ...updates }))}
        />
      )}
    </section>
  )
}

/* ====== Editor inline para ADMIN ====== */
function toNum(val) {
  const n = Number(val)
  return Number.isFinite(n) ? n : null
}

function AdminInlineEditor({ initial, docId, onUpdated }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(initial)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => { setForm(initial) }, [initial])

  async function uploadIfAny() {
    if (!file || !storage) return null
    const blob = await compressToWebP(file, { maxWidth: 1200, quality: 0.85 })
    const path = `products/${docId}-${Date.now()}.webp`
    const ref = storageRef(storage, path)
    const task = uploadBytesResumable(ref, blob, {
      contentType: 'image/webp',
      cacheControl: 'public,max-age=31536000,immutable'
    })
    await new Promise((resolve, reject) => {
      task.on('state_changed',
        s => setProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)),
        reject,
        resolve
      )
    })
    const url = await getDownloadURL(ref)
    return { url, path }
  }

  async function onSave(e) {
    e.preventDefault()
    setBusy(true); setMsg(''); setProgress(0)
    try {
      const upload = await uploadIfAny()
      const updates = {
        name: form.name?.trim() || '',
        description: form.description?.trim() || '',
        category: form.category?.trim() || '',
        brand: form.brand?.trim() || '',
        varietal: form.varietal?.trim() || '',
        origin: form.origin?.trim() || '',
        sku: form.sku?.trim() || '',
        price: toNum(form.price) ?? 0,
        volumeMl: toNum(form.volumeMl),
        abv: toNum(form.abv),
        caseUnits: toNum(form.caseUnits),
        stock: toNum(form.stock),
        img: upload?.url || form.img || '',
      }
      Object.keys(updates).forEach(k => {
        if (updates[k] === null || updates[k] === undefined) delete updates[k]
      })

      await updateDoc(doc(db, 'products', docId), updates)
      setMsg('Producto actualizado.')
      onUpdated?.(updates)
      setOpen(false)
      setFile(null); setProgress(0)
    } catch (err) {
      setMsg(err?.message || 'No se pudo guardar')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mt-10">
      <button
        className="px-4 py-2 rounded-xl2 border border-surface-hard"
        onClick={() => setOpen(o => !o)}
      >
        {open ? 'Cerrar edición' : 'Editar producto (admin)'}
      </button>

      {open && (
        <form onSubmit={onSave} className="mt-4 grid md:grid-cols-3 gap-3 rounded-xl2 border border-surface-hard bg-white p-4">
          <div className="md:col-span-1">
            <label className="text-sm text-neutral-600">Nombre</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} required />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Precio</label>
            <input type="number" className="w-full border rounded-xl2 px-3 py-2"
                   value={form.price ?? ''} onChange={e=>setForm(v=>({...v,price:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Categoría</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.category ?? ''} onChange={e=>setForm(v=>({...v,category:e.target.value}))} />
          </div>

          <div className="md:col-span-3">
            <label className="text-sm text-neutral-600">Descripción</label>
            <textarea className="w-full border rounded-xl2 px-3 py-2 min-h-[90px]"
                      value={form.description ?? ''} onChange={e=>setForm(v=>({...v,description:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Marca</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.brand ?? ''} onChange={e=>setForm(v=>({...v,brand:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Varietal</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.varietal ?? ''} onChange={e=>setForm(v=>({...v,varietal:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Origen</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.origin ?? ''} onChange={e=>setForm(v=>({...v,origin:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Volumen (ml)</label>
            <input type="number" className="w-full border rounded-xl2 px-3 py-2"
                   value={form.volumeMl ?? ''} onChange={e=>setForm(v=>({...v,volumeMl:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">% Alcohol</label>
            <input type="number" step="0.1" className="w-full border rounded-xl2 px-3 py-2"
                   value={form.abv ?? ''} onChange={e=>setForm(v=>({...v,abv:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Caja (u.)</label>
            <input type="number" className="w-full border rounded-xl2 px-3 py-2"
                   value={form.caseUnits ?? ''} onChange={e=>setForm(v=>({...v,caseUnits:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">SKU</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.sku ?? ''} onChange={e=>setForm(v=>({...v,sku:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">Stock</label>
            <input type="number" className="w-full border rounded-xl2 px-3 py-2"
                   value={form.stock ?? ''} onChange={e=>setForm(v=>({...v,stock:e.target.value}))} />
            <p className="text-[11px] text-neutral-500 mt-1">
              Dejar vacío para “stock infinito”.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm text-neutral-600">Imagen (URL)</label>
            <input className="w-full border rounded-xl2 px-3 py-2"
                   value={form.img ?? ''} onChange={e=>setForm(v=>({...v,img:e.target.value}))} />
          </div>

          <div>
            <label className="text-sm text-neutral-600">o subir archivo</label>
            <input type="file" accept="image/*" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
            {file && busy && progress > 0 && (
              <div className="text-xs mt-1">{progress}%</div>
            )}
          </div>

          <div className="md:col-span-3 flex items-center gap-3">
            <button disabled={busy} className="px-4 py-2 rounded-xl2 bg-brand text-white">
              {busy ? 'Guardando...' : 'Guardar cambios'}
            </button>
            {msg && <span className="text-sm">{msg}</span>}
          </div>
        </form>
      )}
    </section>
  )
}
