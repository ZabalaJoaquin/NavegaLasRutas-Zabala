// src/components/RelatedProducts.jsx
import { useEffect, useState } from 'react'
import { db, collection, getDocs } from '../utils/firebase.js'
import ProductCard from './ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'

export default function RelatedProducts({ currentId, category, title = 'También te puede interesar' }) {
  const [items, setItems] = useState([])
  const { addToCart } = useCart()

  useEffect(() => {
    (async () => {
      try {
        const qs = await getDocs(collection(db, 'products'))
        const arr = []
        qs.forEach(d => arr.push({ id: d.id, ...d.data() }))
        const filtered = arr
          .filter(p => p.id !== currentId && (!!category ? p.category === category : true))
          .slice(0, 6)
        if (filtered.length) { setItems(filtered); return }
        // fallback JSON local
        const local = (await import('../data/products.json')).default
        const filteredLocal = local
          .map(p => ({ id: p.id || p.name?.toLowerCase().replace(/\s+/g,'-'), ...p }))
          .filter(p => p.id !== currentId && (!!category ? p.category === category : true))
          .slice(0, 6)
        setItems(filteredLocal)
      } catch {
        const local = (await import('../data/products.json')).default
        const filteredLocal = local
          .map(p => ({ id: p.id || p.name?.toLowerCase().replace(/\s+/g,'-'), ...p }))
          .filter(p => p.id !== currentId && (!!category ? p.category === category : true))
          .slice(0, 6)
        setItems(filteredLocal)
      }
    })()
  }, [currentId, category])

  if (!items.length) return null

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {items.map(p => (
          <ProductCard key={p.id} product={p} onAdd={addToCart} />
        ))}
      </div>
    </section>
  )
}
