import { useEffect, useState } from 'react'
import ProductCard from './ProductCard.jsx'
import { isFirebaseEnabled, db, collection, getDocs } from '../utils/firebase.js'

export default function ProductList({ category }) {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])

  useEffect(() => {
    let alive = true
    async function load(){
      setLoading(true)
      try {
        if (isFirebaseEnabled()) {
          const qs = await getDocs(collection(db, 'products'))
          const arr = []
          qs.forEach(d => arr.push(d.data()))
          setProducts(arr)
        } else {
          const local = await import('../data/products.json')
          setProducts(local.default)
        }
        
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [])

  const filtered = category ? products.filter(p => p.category === category) : products

  if (loading) return <div className="p-6">Cargando productos…</div>
  if (!filtered.length) return <div className="p-6">Sin resultados.</div>

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filtered.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
