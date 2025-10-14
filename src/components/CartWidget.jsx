import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function CartWidget(){
  const { count } = useCart()
  return (
    <Link to="/carrito" className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-soft border border-surface-hard">
      <span className="i">🛒</span>
      <span className="text-sm">{count}</span>
    </Link>
  )
}
