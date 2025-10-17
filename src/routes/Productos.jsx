import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { db, collection, getDocs } from '../utils/firebase.js'
import ProductCard from '../components/ProductCard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

function slugify(s='') {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    .replace(/-+/g,'-').slice(0,60)
}
function norm(s='') {
  return s.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
}
function getStableId(p, i) {
  // siempre agrego sufijo -i para evitar colisiones de key
  const base = p.id || p.routeKey || p.sku || (p.name ? slugify(p.name) : 'producto')
  return `${base}-${i}`
}
function expandQuery(q='') {
  const x = norm(q)
  const tokens = x.split(/\s+/).filter(Boolean)
  const out = new Set(tokens)
  tokens.forEach(t => {
    if (['whiski','wiski','whiskey'].includes(t)) out.add('whisky')
    if (t === 'vino' || t === 'vinos') out.add('vino')
    if (t === 'champagne' || t === 'espumante' || t === 'espumantes') out.add('champagne')
    if (t === 'ron' || t === 'rhum') out.add('ron')
    if (t === 'fernet') out.add('fernet')
    if (t === 'energizante' || t === 'energizantes' || t === 'energy') out.add('energizante')
  })
  return Array.from(out)
}

export default function Productos() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const location = useLocation()

  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('todas') 

  // leo ?q= del URL si existe (viene desde el Home)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const initialQ = params.get('q') || ''
    if (initialQ) setQ(initialQ)
  }, [location.search])

  // carga productos (Firestore -> JSON fallback)
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const qs = await getDocs(collection(db, 'products'))
        const arr = []
        qs.forEach(d => {
          const data = d.data()
          arr.push({ id: d.id, routeKey: d.id, ...data })
        })
        if (arr.length) { setAll(arr); setLoading(false); return }
        const local = (await import('../data/products.json')).default
        setAll(local.map(p => {
          const key = p.id || slugify(p.name || '')
          return { id: key, routeKey: key, ...p }
        }))
      } catch {
        const local = (await import('../data/products.json')).default
        setAll(local.map(p => {
          const key = p.id || slugify(p.name || '')
          return { id: key, routeKey: key, ...p }
        }))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // construir lista de categorías (presentación)
  const categories = useMemo(() => {
    const set = new Set()
    all.forEach(p => {
      const c = (p.category || '').toString().trim()
      set.add(c || 'Sin categoría')
    })
    const arr = Array.from(set).sort((a,b)=>a.localeCompare(b,'es'))
    // orden manual para que aparezcan primero
    const prefer = ['Vinos','Whisky','Fernet','Champagne','Ron','Energizante']
    arr.sort((a,b) => {
      const ia = prefer.indexOf(a); const ib = prefer.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b,'es')
    })
    return arr
  }, [all])

  // aplicar filtros (texto + categoría)
  const filtered = useMemo(() => {
    const tokens = expandQuery(q)
    return all.filter(p => {
      const catLabel = (p.category || 'Sin categoría')
      if (cat !== 'todas' && catLabel !== cat) return false

      if (!tokens.length) return true
      const haystack = norm([
        p.name, p.description, p.category, p.brand, p.varietal, p.origin, p.sku
      ].filter(Boolean).join(' '))
      // que estén todos los tokens
      return tokens.every(t => haystack.includes(t))
    })
  }, [all, q, cat])

  // agrupar por categoría para render por secciones
  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(p => {
      const c = (p.category || 'Sin categoría')
      if (!map.has(c)) map.set(c, [])
      map.get(c).push(p)
    })
    // ordenar cada grupo por nombre
    for (const [k, arr] of map) arr.sort((a,b)=> (a.name||'').localeCompare(b.name||'','es'))
    // respetar orden de categories (calculado arriba)
    const order = cat === 'todas' ? categories : [cat]
    return order.filter(c => map.has(c)).map(c => ({ category: c, items: map.get(c) }))
  }, [filtered, categories, cat])

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Productos</h1>

      {/* filtros */}
      <div className="mb-5 grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2">
          <input
            className="w-full border border-surface-hard rounded-xl2 px-3 py-2"
            placeholder="Buscar por nombre, detalle, marca, categoría… (ej: ron, whisky, malbec)"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
        <div>
          <select
            className="w-full border border-surface-hard rounded-xl2 px-3 py-2 bg-white"
            value={cat}
            onChange={e => setCat(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {!user && (
        <div className="mb-4 text-sm text-neutral-600">
          Iniciá sesión para ver precios.
        </div>
      )}

      {loading ? (
        <div>Cargando…</div>
      ) : grouped.length === 0 ? (
        <div className="text-neutral-600">No encontramos productos que coincidan con tu búsqueda.</div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ category, items }) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-3">{category}</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {items.map((p, i) => {
                  const stableId = getStableId(p, i)
                  const product = { id: stableId, ...p }
                  return (
                    <ProductCard
                      key={stableId}
                      product={product}
                      onAdd={addToCart}
                    />
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
