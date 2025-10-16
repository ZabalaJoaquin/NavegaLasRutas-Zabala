// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CartCtx = createContext(null)
const LS_KEY = 'dmx.cart'

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    // leo carrito guardado (si existe)
    try {
      const raw = localStorage.getItem(LS_KEY)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })

  // persisto cada cambio
  useEffect(() => {
    try { localStorage.setItem(LS_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  // ayuda: me dice si el producto tiene stock numérico
  function hasStockNumber(product) {
    return product != null && Number.isFinite(Number(product.stock))
  }

  // suma al carrito respetando el stock disponible
  function addToCart(product, qty = 1) {
    const id = product?.id ?? String(Date.now()) // id estable
    const price = Number(product?.price ?? 0)
    const want = Math.max(1, Number(qty ?? 1))   // cantidad que quiero agregar

    setItems(prev => {
      const idx = prev.findIndex(p => p.id === id)

      // si hay stock numérico, calculo cuánto puedo agregar
      let allowed = want
      if (hasStockNumber(product)) {
        const already = idx >= 0 ? Number(prev[idx].qty || 0) : 0
        const available = Math.max(0, Number(product.stock) - already)
        allowed = Math.min(want, available)
        if (allowed <= 0) return prev // no queda stock para sumar
      }

      if (idx >= 0) {
        const next = [...prev]
        next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + allowed }
        return next
      }
      return [
        ...prev,
        {
          id,
          name: product?.name ?? 'Producto',
          img: product?.img ?? '',
          category: product?.category ?? '',
          price,
          qty: allowed,
          // guardo stock actual para que los componentes puedan mostrarlo si hace falta
          stock: hasStockNumber(product) ? Number(product.stock) : null
        }
      ]
    })
  }

  // cambia cantidad respetando stock
  function updateQty(id, qty) {
    const n = Math.max(0, Number(qty ?? 0))
    setItems(prev => {
      const current = prev.find(p => p.id === id)
      if (!current) return prev

      // si el item conoce stock, capeamos
      const limit = Number.isFinite(Number(current.stock)) ? Number(current.stock) : null
      const capped = limit == null ? n : Math.min(n, Math.max(0, limit))

      return capped <= 0
        ? prev.filter(p => p.id !== id)
        : prev.map(p => (p.id === id ? { ...p, qty: capped } : p))
    })
  }

  function removeItem(id) { setItems(prev => prev.filter(p => p.id !== id)) }
  function clear() {
    setItems([])
    try { localStorage.removeItem(LS_KEY) } catch {}
  }

  // total $ y total unidades
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
