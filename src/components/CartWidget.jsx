import { NavLink } from 'react-router-dom'
import { useCart } from '../context/CartContext.jsx'

export default function CartWidget() {
  const { count } = useCart()

  return (
    <NavLink to="/carrito" className="relative inline-flex items-center">
      {/* Ícono simple de carrito */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
           className="w-6 h-6 text-neutral-700">
        <path fill="currentColor" d="M7 18a2 2 0 1 0 0 4a2 2 0 0 0 0-4m10 0a2 2 0 1 0 0 4a2 2 0 0 0 0-4M5.1 6h14.5l-1.75 7H8.23l-.37 1.5h9.64v2H6.55l-1.45-9H3V6z"/>
      </svg>

      {/* Badge con cantidad */}
      {count > 0 && (
        <span className="absolute -top-2 -right-2 min-w-5 h-5 rounded-full bg-brand text-white text-xs font-bold grid place-items-center px-1">
          {count}
        </span>
      )}
    </NavLink>
  )
}
