import { Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import { formatARS } from '../utils/currency.js'

export default function ProductCard({ product, onAdd }) {
  const { user } = useAuth()
  const isLogged = !!user
  const id = product.id

  return (
    <div className="border border-surface-hard rounded-xl2 p-3 bg-white flex flex-col">
      <img src={product.img} alt={product.name} className="w-full h-40 object-contain mb-2" />
      <div className="font-medium">{product.name}</div>
      <div className="text-sm text-neutral-600">{product.category}</div>

      <div className="mt-1 h-6">
        {isLogged ? (
          <span className="text-brand-dark font-semibold">{formatARS(product.price)}</span>
        ) : (
          <span className="text-neutral-500 text-sm">Iniciá sesión para ver precios</span>
        )}
      </div>

      <div className={`mt-3 grid ${isLogged ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
        <Link
          to={`/producto/${id}`}
          className="px-3 py-2 rounded-xl2 border border-surface-hard text-center text-sm"
        >
          Ver detalle
        </Link>
        {isLogged && (
          <button
            className="px-3 py-2 rounded-xl2 bg-brand text-white text-sm"
            onClick={() => onAdd?.(product, 1)}
          >
            Agregar
          </button>
        )}
      </div>
    </div>
  )
}
