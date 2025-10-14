import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartCtx = createContext();
export const useCart = () => useContext(CartCtx);

export default function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem("cart") ?? "[]"); }
    catch { return []; }
  });

  useEffect(() => { localStorage.setItem("cart", JSON.stringify(items)); }, [items]);

  const addItem = (product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(p => p.id === product.id);
      if (i >= 0) { const copy = [...prev]; copy[i] = { ...copy[i], qty: copy[i].qty + qty }; return copy; }
      return [...prev, { ...product, qty }];
    });
  };

  const removeItem = (id) => setItems(prev => prev.filter(p => p.id !== id));
  const clearCart = () => setItems([]);

  const totalQty = useMemo(() => items.reduce((a, b) => a + b.qty, 0), [items]);
  const totalPrice = useMemo(() => items.reduce((a, b) => a + b.qty * (b.price ?? 0), 0), [items]);

  return <CartCtx.Provider value={{ items, addItem, removeItem, clearCart, totalQty, totalPrice }}>{children}</CartCtx.Provider>;
}
