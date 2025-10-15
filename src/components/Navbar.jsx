import { NavLink, Link } from 'react-router-dom'
import logo from '../assets/logo-transparente.png'
import CartWidget from './CartWidget.jsx'
// Alias para evitar el choque “Identifier 'useAuth' has already been declared”
import { useAuth as useAuthCtx } from '../auth/AuthContext.jsx'

const classes = ({ isActive }) =>
  isActive ? 'text-brand-dark font-semibold' : 'text-neutral-700 hover:text-brand-dark'

export default function Navbar(){
  const { user, logout, isAdmin } = useAuthCtx()
  const ADMIN_EMAILS = ['distrimax.alvear@gmail.com']
  const showAdmin = isAdmin || ADMIN_EMAILS.includes(user?.email ?? '')

  return (
    <header className="bg-white/90 backdrop-blur border-b border-surface-hard">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Distrimax" className="h-9 w-auto" />
          <span className="sr-only">Distrimax</span>
        </Link>

        <nav className="ml-auto flex items-center gap-4">
          <NavLink to="/" className={classes} end>Inicio</NavLink>
          <NavLink to="/productos" className={classes}>Productos</NavLink>
          <NavLink to="/nosotros" className={classes}>Nosotros</NavLink>
          <NavLink to="/contacto" className={classes}>Contacto</NavLink>
          {showAdmin && <NavLink to="/admin" className={classes}>Admin</NavLink>}
          {user ? (
            <button onClick={logout} className="text-neutral-700 hover:text-brand-dark">Salir</button>
          ) : (
            <NavLink to="/login" className={classes}>Ingresar</NavLink>
          )}
          <CartWidget />
        </nav>
      </div>
    </header>
  )
}
