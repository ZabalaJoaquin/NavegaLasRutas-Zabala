// src/routes/Productos.jsx
import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { db, collection, getDocs } from '../utils/firebase.js'
import ProductCard from '../components/ProductCard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const norm = (s='') =>
  s.toString().toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')

const slugify = (s='') =>
  norm(s).replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'').replace(/-+/g,'-').slice(0,60)

const listKey = (p,i) => `${p.id || p.routeKey || p.sku || slugify(p.name || 'producto')}-${i}`

function expandQuery(q='') {
  const x = norm(q)
  const tokens = x.split(/\s+/).filter(Boolean)
  const out = new Set(tokens)
  tokens.forEach(t => {
    if (['whiski','wiski','whiskey'].includes(t)) out.add('whisky')
    if (t === 'vinos') out.add('vino')
    if (['champagne','espumante','espumantes'].includes(t)) out.add('champagne')
    if (t === 'rhum') out.add('ron')
    if (['energizantes','energy'].includes(t)) out.add('energizante')
  })
  return Array.from(out)
}

export default function Productos() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const location = useLocation()
  const navigate = useNavigate()

  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('todas')

  // lee ?q= al entrar (desde Home)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const initialQ = params.get('q') || ''
    if (initialQ) setQ(initialQ)
  }, [location.search])

  // carga productos (Firestore -> JSON local)
  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const qs = await getDocs(collection(db, 'products'))
        const arr = []
        qs.forEach(d => arr.push({ id: d.id, routeKey: d.id, ...d.data() }))
        if (arr.length) { setAll(arr); return }
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

  // categorias únicas + orden preferente
  const categories = useMemo(() => {
    const set = new Set()
    all.forEach(p => set.add((p.category || 'Sin categoría').toString().trim() || 'Sin categoría'))
    const base = Array.from(set)
    const prefer = ['Vinos','Whisky','Fernet','Champagne','Ron','Energizante']
    base.sort((a,b) => {
      const ia = prefer.indexOf(a), ib = prefer.indexOf(b)
      if (ia !== -1 && ib !== -1) return ia - ib
      if (ia !== -1) return -1
      if (ib !== -1) return 1
      return a.localeCompare(b,'es')
    })
    return base
  }, [all])

  // filtro texto + categoría
  const filtered = useMemo(() => {
    const tokens = expandQuery(q)
    return all.filter(p => {
      const catLabel = (p.category || 'Sin categoría')
      if (cat !== 'todas' && catLabel !== cat) return false
      if (!tokens.length) return true
      const haystack = norm([
        p.name, p.description, p.category, p.brand, p.varietal, p.origin, p.sku
      ].filter(Boolean).join(' '))
      return tokens.every(t => haystack.includes(t))
    })
  }, [all, q, cat])

  // agrupado por categoría
  const grouped = useMemo(() => {
    const map = new Map()
    filtered.forEach(p => {
      const c = (p.category || 'Sin categoría')
      if (!map.has(c)) map.set(c, [])
      map.get(c).push(p)
    })
    for (const arr of map.values()) arr.sort((a,b)=> (a.name||'').localeCompare(b.name||'','es'))
    const order = cat === 'todas' ? categories : [cat]
    return order.filter(c => map.has(c)).map(c => ({ category: c, items: map.get(c) }))
  }, [filtered, categories, cat])

  // sincroniza ?q= en la URL (UX linda al compartir búsqueda)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const current = params.get('q') || ''
    if (q.trim() !== current) {
      if (q.trim()) params.set('q', q.trim()); else params.delete('q')
      navigate({ search: params.toString() }, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q])

  return (
    <section className="max-w-7xl mx-auto px-6 md:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">Productos</h1>
        <div className="text-sm text-neutral-600">{filtered.length} resultados</div>
      </div>

      <div className="mb-6 grid md:grid-cols-3 gap-3">
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

      {!user && <div className="mb-4 text-sm text-neutral-600">Iniciá sesión para ver precios.</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_,i)=>(
            <div key={i} className="h-64 rounded-xl2 border border-surface-hard bg-white">
              <div className="h-full w-full animate-pulse bg-surface-soft rounded-xl2" />
            </div>
          ))}
        </div>
      ) : grouped.length === 0 ? (
        <div className="text-neutral-600">No encontramos productos que coincidan con tu búsqueda.</div>
      ) : (
        <div className="space-y-10">
          {grouped.map(({ category, items }) => (
            <section key={category}>
              <h2 className="text-xl font-semibold mb-3">{category}</h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map((p, i) => (
                  <ProductCard
                    key={listKey(p, i)}
                    product={p}          // ⇒ preserva p.id original para stock/checkout
                    onAdd={addToCart}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
