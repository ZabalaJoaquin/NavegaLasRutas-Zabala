// src/routes/Home.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db, collection, getDocs } from '../utils/firebase.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import ProductList from '../components/ProductList.jsx'
import Brands from '../components/Brands.jsx'
import logo from '../assets/logo-transparente.png'

/* --- Imagen con placeholder inline (sin AiImage.jsx) --- */
function ImgPh({ src, alt = '', className = '', rounded = 'rounded-2xl' }) {
  const [error, setError] = useState(false)
  if (!src || error) {
    return (
      <div className={`${rounded} ${className} relative overflow-hidden border border-surface-hard`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/20 via-white to-brand/20" />
        <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-brand/20 blur-2xl" />
        <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-brand/20 blur-2xl" />
        <div className="relative h-full w-full grid place-items-center">
          <span className="text-sm text-neutral-600">Imagen pendiente</span>
        </div>
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      className={`${rounded} ${className} border border-surface-hard object-cover`}
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

/* Helpers */
function preferOrder(a, b) {
  const pref = ['Vinos','Whisky','Fernet','Champagne','Ron','Energizante']
  const ia = pref.indexOf(a), ib = pref.indexOf(b)
  if (ia !== -1 && ib !== -1) return ia - ib
  if (ia !== -1) return -1
  if (ib !== -1) return 1
  return a.localeCompare(b, 'es')
}

export default function Home() {
  const { user } = useAuth()
  const { addToCart } = useCart()
  const navigate = useNavigate()

  const [all, setAll] = useState([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    (async () => {
      setLoading(true)
      try {
        const qs = await getDocs(collection(db, 'products'))
        const arr = []
        qs.forEach(d => arr.push({ id: d.id, routeKey: d.id, ...d.data() }))
        if (arr.length) { setAll(arr); setLoading(false); return }
        const local = (await import('../data/products.json')).default
        setAll(local.map(p => {
          const key = p.id || (p.name || 'producto').toLowerCase().replace(/\s+/g,'-')
          return { id: key, routeKey: key, ...p }
        }))
      } catch {
        const local = (await import('../data/products.json')).default
        setAll(local.map(p => {
          const key = p.id || (p.name || 'producto').toLowerCase().replace(/\s+/g,'-')
          return { id: key, routeKey: key, ...p }
        }))
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  /* categorías armadas desde datos */
  const categories = useMemo(() => {
    const map = new Map()
    all.forEach(p => {
      const c = (p.category || 'Sin categoría').toString().trim()
      map.set(c, (map.get(c) || 0) + 1)
    })
    return Array.from(map.entries())
      .sort((a,b) => preferOrder(a[0], b[0]))
  }, [all])

  /* destacados: últimos por createdAt si existe o por nombre */
  const featured = useMemo(() => {
    const copy = [...all]
    copy.sort((a,b) => {
      const an = a?.createdAt?.seconds || 0
      const bn = b?.createdAt?.seconds || 0
      if (an !== bn) return bn - an
      return (a.name || '').localeCompare(b.name || '', 'es')
    })
    return copy.slice(0, 6)
  }, [all])

  function onSearchSubmit(e) {
    e.preventDefault()
    const val = q.trim()
    navigate(val ? `/productos?q=${encodeURIComponent(val)}` : '/productos')
  }

  return (
    <section className="relative">
      {/* FONDO “tech” con degradés brand */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-brand/10" />
        <div className="absolute -top-40 -left-32 w-[26rem] h-[26rem] rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-[26rem] h-[26rem] rounded-full bg-brand/20 blur-3xl" />
      </div>

      {/* HERO */}
      <div className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 pt-12 pb-10 md:pt-16 md:pb-14">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <img src={logo} alt="Distrimax" className="h-14 w-auto opacity-90" />
              <h1 className="mt-4 text-3xl md:text-5xl font-extrabold tracking-tight">
                Distribuidora de bebidas en <span className="text-brand-dark">General Alvear</span>
              </h1>
              <p className="mt-3 text-neutral-700 max-w-prose">
                Mayorista de vinos, whiskies, espumantes, energizantes y más. Clientes registrados
                ven precios y compran online.
              </p>

              {/* Buscador */}
              <form onSubmit={onSearchSubmit} className="mt-5">
                <div className="relative">
                  <input
                    value={q}
                    onChange={e=>setQ(e.target.value)}
                    className="w-full rounded-xl2 border border-surface-hard bg-white/90 backdrop-blur px-4 py-2.5 pl-11 outline-none focus:ring-2 focus:ring-brand/40"
                    placeholder="Buscar productos (malbec, whisky, ron…) "
                  />
                  <svg className="absolute left-3 top-2.5 h-6 w-6 text-neutral-400" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <Link to="/productos" className="px-4 py-2 rounded-xl2 border border-surface-hard bg-white">
                    Ver productos
                  </Link>
                  {!user && (
                    <Link to="/login" className="px-4 py-2 rounded-xl2 bg-brand text-white">
                      Ingresar
                    </Link>
                  )}
                </div>
              </form>
            </div>

            {/* Mosaico de imágenes (sin AiImage.jsx) */}
            <div className="grid grid-cols-2 gap-3">
              <ImgPh src="/ai/hero-1.webp" className="h-44 md:h-56 w-full" />
              <ImgPh src="/ai/hero-2.webp" className="h-44 md:h-72 w-full" />
              <ImgPh src="/ai/hero-3.webp" className="h-36 md:h-48 w-full col-span-2" />
            </div>
          </div>
        </div>
      </div>

      {/* FRANJA DE MARCAS OFICIALES */}
      <Brands />

      {/* CATEGORÍAS */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <h2 className="text-xl font-semibold mb-3">Explorar por categoría</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="h-16 rounded-xl2 bg-surface-soft animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories.map(([name, count]) => (
              <Link
                key={name}
                to="/productos"
                className="group rounded-xl2 border border-surface-hard bg-white p-3 hover:shadow transition"
                title={`Ver ${name}`}
              >
                <div className="text-sm text-neutral-700">{name || 'Sin categoría'}</div>
                <div className="text-xs text-neutral-500">{count} productos</div>
                <div className="mt-2 text-brand-dark text-xs opacity-0 group-hover:opacity-100 transition">
                  Ver catálogo →
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* DESTACADOS */}
      <div className="max-w-6xl mx-auto px-4 mt-10 mb-14">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Destacados</h2>
          <Link to="/productos" className="text-sm text-brand-dark hover:underline">Ver todo</Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mt-3">
            {Array.from({length:6}).map((_,i)=>(
              <div key={i} className="h-64 rounded-xl2 border border-surface-hard bg-white">
                <div className="h-full w-full animate-pulse bg-surface-soft rounded-xl2" />
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="mt-3 text-neutral-600">No hay productos para mostrar.</div>
        ) : (
          <div className="mt-3">
            <ProductList products={featured} onAdd={addToCart} />
          </div>
        )}
      </div>

      {/* CTA inferior */}
      <div className="bg-gradient-to-r from-brand/10 via-transparent to-brand/10">
        <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-4">
          <div className="rounded-xl2 border border-surface-hard bg-white p-4">
            <div className="font-semibold">Atención a clientes</div>
            <p className="text-sm text-neutral-700 mt-1">Consultas sobre pedidos, stock y entregas.</p>
          </div>
          <div className="rounded-xl2 border border-surface-hard bg-white p-4">
            <div className="font-semibold">Marcas y bodegas</div>
            <p className="text-sm text-neutral-700 mt-1">Trabajamos con líderes del mercado y proyectos regionales.</p>
          </div>
          <div className="rounded-xl2 border border-surface-hard bg-white p-4">
            <div className="font-semibold">Ubicación</div>
            <p className="text-sm text-neutral-700 mt-1">General Alvear, Mendoza. Entregas en zona.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
