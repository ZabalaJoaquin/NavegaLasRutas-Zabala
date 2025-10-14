import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { db, collection, getDocs } from '../utils/firebase.js'
import { formatARS } from '../utils/currency.js'
import ProductCard from '../components/ProductCard.jsx' // si lo usás

export default function Productos() {
  const { user } = useAuth()
  const canSeePrices = !!user
  const [products, setProducts] = useState([])

  useEffect(() => {
    (async () => {
      try {
        const qs = await getDocs(collection(db, 'products'))
        const arr = []
        qs.forEach(d => arr.push({ id: d.id, ...d.data() }))
        if (arr.length === 0) {
          const local = (await import('../data/products.json')).default
          setProducts(local)
        } else {
          setProducts(arr)
        }
      } catch {
        const local = (await import('../data/products.json')).default
        setProducts(local)
      }
    })()
  }, [])

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Productos</h1>

      {!canSeePrices && (
        <div className="mb-4 text-sm text-neutral-600">
          Iniciá sesión para ver los precios.
        </div>
      )}

      {/* Si usás ProductCard */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* --- Si NO usás ProductCard, ejemplo inline ---
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map(p => (
          <div key={p.id} className="border rounded-xl2 p-3 bg-white">
            <img src={p.img} alt={p.name} className="w-full h-40 object-contain mb-2" />
            <div className="font-medium">{p.name}</div>
            <div className="text-sm text-neutral-600">{p.category}</div>
            <div className="mt-1 h-6">
              {canSeePrices ? (
                <span className="text-brand-dark font-semibold">{formatARS(p.price)}</span>
              ) : (
                <span className="text-neutral-500 text-sm">Iniciá sesión para ver precios</span>
              )}
            </div>
          </div>
        ))}
      </div>
      */}
    </section>
  )
}
