import { useCart } from '../context/CartContext.jsx'
import QuantitySelector from '../components/QuantitySelector.jsx'
import { Link } from 'react-router-dom'
import { formatARS } from '../utils/currency.js'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Cart() {
  const { user } = useAuth()
  const canSeePrices = !!user
  const { items, updateQty, removeItem, clear } = useCart()

  const safeItems = items.map(it => ({
    ...it,
    price: Number(it?.price ?? 0),
    qty: Number(it?.qty ?? 1),
  }))
  const totalAmount = safeItems.reduce((acc, it) => acc + it.price * it.qty, 0)

  return (
    <section className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Tu carrito</h1>

      {safeItems.length === 0 ? (
        <div className="bg-surface-soft border border-surface-hard rounded-xl2 p-6">
          <p>El carrito está vacío.</p>
          <Link to="/productos" className="inline-block mt-4 px-4 py-2 rounded-xl2 bg-brand text-white">
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {safeItems.map(it => {
            const line = it.price * it.qty
            return (
              <div key={it.id} className="flex items-center gap-4 border border-surface-hard rounded-xl2 p-3 bg-white">
                <img src={it.img} className="w-16 h-16 object-contain" alt={it.name} />
                <div className="flex-1">
                  <div className="font-medium">{it.name}</div>
                  <div className="text-sm text-neutral-600">
                    {it.category}
                    {canSeePrices && <> · {formatARS(it.price)}</>}
                  </div>
                </div>
                <QuantitySelector value={it.qty} onChange={(v) => updateQty(it.id, Number(v))} />
                <div className="w-28 text-right font-semibold">
                  {canSeePrices ? formatARS(line) : <span className="text-neutral-500">—</span>}
                </div>
                <button className="text-red-600" onClick={() => removeItem(it.id)}>
                  Eliminar
                </button>
              </div>
            )
          })}

          <div className="flex items-center justify-between border-t pt-4">
            <button onClick={clear} className="text-sm underline text-neutral-600">
              Vaciar carrito
            </button>
            <div className="text-right">
              <div className="text-neutral-600 text-sm">Total</div>
              <div className="text-2xl font-extrabold">
                {canSeePrices ? formatARS(totalAmount) : <span className="text-neutral-500">—</span>}
              </div>
              {canSeePrices ? (
                <Link to="/checkout" className="inline-block mt-3 px-5 py-2 rounded-xl2 bg-brand text-white font-semibold">
                  Continuar
                </Link>
              ) : (
                <Link to="/login" className="inline-block mt-3 px-5 py-2 rounded-xl2 bg-brand text-white font-semibold">
                  Iniciá sesión para continuar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
