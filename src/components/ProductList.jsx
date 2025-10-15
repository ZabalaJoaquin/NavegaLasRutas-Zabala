// src/components/ProductList.jsx
import ProductCard from './ProductCard.jsx'
import { useCart } from '../context/CartContext.jsx'

function slugify(s='') {
  return s.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')
    .replace(/-+/g,'-').slice(0,60)
}

function getStableId(p, i) {
  // id preferido para el componente y para la key
  return String(
    p.id ||
    p.routeKey ||
    p.sku ||
    (p.name ? `${slugify(p.name)}` : 'producto') + '-' + i
  )
}

export default function ProductList({ products = [] }) {
  const { addToCart } = useCart()

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
      {products.map((p, i) => {
        const stableId = getStableId(p, i)
        const product = { id: stableId, ...p } // asegura id para ProductCard / rutas
        return (
          <ProductCard
            key={stableId}
            product={product}
            onAdd={addToCart}
          />
        )
      })}
    </div>
  )
}
