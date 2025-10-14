import { useState } from 'react'
import { useCart } from '../context/CartContext.jsx'
import { isFirebaseEnabled, db, addDoc, collection } from '../utils/firebase.js'

export default function Checkout(){
  const { items, total, clear } = useCart()
  const [form, setForm] = useState({ nombre:'', telefono:'', direccion:'' })
  const [orderId, setOrderId] = useState(null)
  const [error, setError] = useState('')
  const disabled = !items.length

  async function submit(e){
    e.preventDefault()
    setError('')
    if (!isFirebaseEnabled()) {
      setOrderId('MODO-DEMO')
      clear()
      return
    }
    try {
      const docRef = await addDoc(collection(db, 'orders'), {
        buyer: form, items, total, createdAt: new Date()
      })
      setOrderId(docRef.id)
      clear()
    } catch (e) {
      setError(e?.message || String(e))
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
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Nombre y apellido" value={form.nombre} onChange={e=>setForm(v=>({...v,nombre:e.target.value}))} required />
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Teléfono" value={form.telefono} onChange={e=>setForm(v=>({...v,telefono:e.target.value}))} required />
        <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" placeholder="Dirección de entrega" value={form.direccion} onChange={e=>setForm(v=>({...v,direccion:e.target.value}))} required />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={disabled} className="w-full mt-2 px-4 py-2 rounded-xl2 bg-brand text-white font-semibold disabled:opacity-50">Confirmar pedido ({items.length} ítems)</button>
        {!isFirebaseEnabled() && <p className="text-xs text-neutral-600">Estás en modo demo (sin Firebase). Configurá Firebase para registrar las órdenes.</p>}
      </form>
    </section>
  )
}
