// src/components/ProductCard.jsx
// Card de producto para el listado. Muestra imagen, nombre, precio (si logeado)
// y el botón "Agregar". Si no hay stock disponible (stock - qty en carrito <= 0)
// el botón pasa a "Sin stock" y queda deshabilitado.

import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'
import { formatARS } from '../utils/currency.js'

export default function ProductCard({ product, onAdd }) {
  const { user } = useAuth()               // para esconder precio a no logeados
  const { items } = useCart()              // miro cuánto ya hay en el carrito

  // ╭──────────────────────────────────────────────────────────────╮
  // │ Cálculo de stock disponible teniendo en cuenta el carrito   │
  // │ - stockDB: viene del producto (number o null/undefined)     │
  // │ - inCart: unidades de este producto ya cargadas al carrito  │
  // │ - remaining: stock que queda para poder agregar             │
  // ╰──────────────────────────────────────────────────────────────╯
  const stockDB = Number.isFinite(Number(product?.stock)) ? Number(product.stock) : null
  const inCart = Number(items.find(i => i.id === product.id)?.qty || 0)
  const remaining = stockDB == null ? Infinity : Math.max(0, stockDB - inCart)
  const outOfStock = remaining <= 0

  // handler de agregar 1 unidad (el CartContext ya capa por stock)
  function handleAdd() {
    if (typeof onAdd === 'function') onAdd(product, 1)
  }

  return (
    <div className="rounded-xl2 border border-surface-hard bg-white p-4">
      {/* Imagen con fallback simple */}
      <Link to={`/producto/${product.routeKey || product.id}`} className="block">
        <div className="relative">
          <img
            src={product.img}
            alt={product.name}
            className="w-full h-52 object-contain bg-white border rounded-xl2"
            onError={(e) => { e.currentTarget.src = '/placeholder.png' }}
          />
          {/* Badge "Sin stock" sobre la imagen */}
          {outOfStock && (
            <span className="absolute top-2 left-2 text-xs bg-neutral-900 text-white px-2 py-1 rounded-full">
              Sin stock
            </span>
          )}
        </div>
      </Link>

      {/* Nombre + categoría */}
      <div className="mt-3">
        <div className="font-semibold leading-tight">{product.name}</div>
        {product.category && (
          <div className="text-xs text-neutral-600 uppercase tracking-wide mt-0.5">
            {product.category}
          </div>
        )}
      </div>

      {/* Precio solo si hay sesión */}
      {user ? (
        <div className="mt-2 font-bold">{formatARS(Number(product.price || 0))}</div>
      ) : (
        <div className="mt-2 text-sm text-neutral-500">Iniciá sesión para ver el precio</div>
      )}

      {/* Acciones */}
      <div className="mt-3 flex gap-2">
        <Link
          to={`/producto/${product.routeKey || product.id}`}
          className="flex-1 px-4 py-2 rounded-xl2 border border-surface-hard text-center"
        >
          Ver detalle
        </Link>

        {/* Botón Agregar: cambia a "Sin stock" y se deshabilita si no hay */}
        <button
          onClick={handleAdd}
          disabled={outOfStock || !user} // si no hay stock o no está logeado, deshabilito
          className={
            'flex-1 px-4 py-2 rounded-xl2 text-white text-center ' +
            (outOfStock || !user
              ? 'bg-neutral-300 cursor-not-allowed'
              : 'bg-neutral-900 hover:opacity-90')
          }
          title={
            !user
              ? 'Ingresá para agregar al carrito'
              : outOfStock
              ? 'No hay stock disponible'
              : 'Agregar al carrito'
          }
        >
          {outOfStock ? 'Sin stock' : 'Agregar'}
        </button>
      </div>

      {/* Info chiquita: muestra cuántas unidades quedan si el producto maneja stock */}
      {stockDB != null && (
        <div className="mt-2 text-[12px] text-neutral-600">
          {outOfStock ? 'Sin unidades disponibles' : `Disponibles: ${remaining}`}
          {inCart > 0 && !outOfStock && ` · En carrito: ${inCart}`}
        </div>
      )}
    </div>
  )
}
