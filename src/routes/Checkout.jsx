// src/routes/Checkout.jsx
import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import {
  isFirebaseEnabled, db, collection, doc, serverTimestamp, runTransaction
} from '../utils/firebase.js'

export default function Checkout(){
  const { items, total, clear } = useCart()
  // datos mínimos para emitir la orden
  const [form, setForm] = useState({ nombre:'', telefono:'', direccion:'' })
  const [orderId, setOrderId] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const disabled = !items.length

  async function submit(e){
    e.preventDefault()
    setError('')
    setOrderId(null)

    // modo demo: sin firebase
    if (!isFirebaseEnabled()) {
      setOrderId('MODO-DEMO')
      clear()
      return
    }

    // si no hay items, no sigo
    if (!items.length) {
      setError('El carrito está vacío')
      return
    }

    try {
      setSaving(true)

      // creo una referencia de documento para la orden (así tengo el id desde antes)
      const orderRef = doc(collection(db, 'orders'))

      // transacción: valida y descuenta stock + crea la orden
      await runTransaction(db, async (tx) => {
        // 1) Validar y descontar stock por cada ítem
        for (const it of items) {
          const pRef = doc(db, 'products', it.id)
          const pSnap = await tx.get(pRef)
          if (!pSnap.exists()) {
            throw new Error(`Producto no encontrado: ${it.name}`)
          }
          const pdata = pSnap.data()
          const stock = Number.isFinite(Number(pdata.stock)) ? Number(pdata.stock) : null

          // si el producto maneja stock numérico, verifico y descuento
          if (stock !== null) {
            const need = Number(it.qty || 0)
            if (stock < need) {
              throw new Error(`Stock insuficiente de "${pdata.name || it.name}". Disponible: ${stock}, solicitado: ${need}.`)
            }
            tx.update(pRef, { stock: stock - need })
          }
        }

        // 2) crear la orden (si todo dio bien)
        const orderData = {
          buyer: { ...form },
          items: items.map(it => ({
            id: it.id,
            name: it.name,
            price: Number(it.price || 0),
            qty: Number(it.qty || 0)
          })),
          total: Number(total || 0),
          createdAt: serverTimestamp(),
          status: 'created'
        }
        tx.set(orderRef, orderData)
      })

      // si llegué acá, la transacción se comiteó OK
      setOrderId(orderRef.id)
      clear() // vacío el carrito al finalizar
    } catch (e) {
      setError(e?.message || String(e))
    } finally {
      setSaving(false)
    }
  }

  if (orderId) {
    return (
      <section className="max-w-lg mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">¡Gracias por tu compra!</h1>
        <p className="mb-4">Código de orden: <span className="font-mono">{orderId}</span></p>
        <a href="/" className="text-brand-dark underline">Volver al inicio</a>
      </section>
    )
  }

  return (
    <section className="max-w-lg mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-4">Checkout</h1>
      <form onSubmit={submit} className="space-y-3">
        {/* datos del comprador */}
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2"
               placeholder="Nombre y apellido"
               value={form.nombre}
               onChange={e=>setForm(v=>({...v,nombre:e.target.value}))}
               required />
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2"
               placeholder="Teléfono"
               value={form.telefono}
               onChange={e=>setForm(v=>({...v,telefono:e.target.value}))}
               required />
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2"
               placeholder="Dirección de entrega"
               value={form.direccion}
               onChange={e=>setForm(v=>({...v,direccion:e.target.value}))}
               required />

        {/* mensajes y CTA */}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          disabled={disabled || saving}
          className="w-full mt-2 px-4 py-2 rounded-xl2 bg-brand text-white font-semibold disabled:opacity-50"
        >
          {saving ? 'Procesando…' : `Confirmar pedido (${items.length} ítems)`}
        </button>

        {!isFirebaseEnabled() && (
          <p className="text-xs text-neutral-600">
            Estás en modo demo (sin Firebase). Configurá Firebase para registrar las órdenes.
          </p>
        )}
      </form>
    </section>
  )
}
