import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)
const LS_KEY = 'dmx.cart'

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  function addToCart(product, qty = 1) {
    const id = product?.id ?? String(Date.now())
    const price = Number(product?.price ?? 0)
    const safeQty = Number(qty ?? 1)
    setItems(prev => {
      const i = prev.findIndex(p => p.id === id)
      if (i >= 0) {
        const next = [...prev]
        next[i] = { ...next[i], qty: Number(next[i].qty ?? 0) + safeQty }
        return next
      }
      return [...prev, {
        id,
        name: product?.name ?? 'Producto',
        img: product?.img ?? '',
        category: product?.category ?? '',
        price,
        qty: safeQty
      }]
    })
  }

  function updateQty(id, qty) {
    const n = Number(qty ?? 0)
    setItems(prev => (n <= 0 ? prev.filter(p => p.id !== id) : prev.map(p => (p.id === id ? { ...p, qty: n } : p))))
  }

  function removeItem(id) { setItems(prev => prev.filter(p => p.id !== id)) }
  function clear() {
    setItems([])
    try { localStorage.removeItem(LS_KEY) } catch {}
  }

  const total = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.price || 0) * Number(it.qty || 0), 0),
    [items]
  )
  const count = useMemo(
    () => items.reduce((acc, it) => acc + Number(it.qty || 0), 0),
    [items]
  )

  return (
    <CartCtx.Provider value={{ items, addToCart, updateQty, removeItem, clear, total, count }}>
      {children}
    </CartCtx.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartCtx)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
