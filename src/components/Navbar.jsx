import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo-transparente.png'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

// clase para links con estado activo/hover
const linkCls = ({ isActive }) =>
  (isActive
    ? 'text-brand-dark font-semibold'
    : 'text-neutral-700 hover:text-brand-dark') +
  ' transition-colors'

export default function Navbar() {
  // auth y cart
  const { user, logout, isAdmin } = useAuth()
  const { items } = useCart()

  // estado UI
  const [open, setOpen] = useState(false)        // menú mobile
  const [userMenu, setUserMenu] = useState(false) // menú usuario
  const loc = useLocation()

  // refs para cerrar menús al clickear afuera
  const userMenuRef = useRef(null)
  const mobileRef = useRef(null)

  // cerrar menús al navegar
  useEffect(() => {
    setOpen(false)
    setUserMenu(false)
  }, [loc.pathname])

  // cerrar user menu al click afuera / ESC
  useEffect(() => {
    function onDocClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenu(false)
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') { setUserMenu(false); setOpen(false) }
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onEsc)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onEsc)
    }
  }, [])

  // total de unidades en el carrito
  const cartCount = useMemo(
    () => (items || []).reduce((acc, it) => acc + Number(it.qty || 0), 0),
     [items]
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-hard bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      {/* glow sutil brand arriba */}
      <div className="absolute inset-x-0 -top-10 h-10 pointer-events-none bg-gradient-to-b from-brand/10 to-transparent" />

      {/* contenedor más ancho + padding cómodo */}
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Distrimax" className="h-9 w-auto" />
            <span className="hidden sm:block font-bold tracking-tight">Distrimax</span>
          </Link>
        </div>

        {/* Links escritorio */}
        <div className="hidden md:flex items-center gap-7">
          <NavLink to="/" className={linkCls}>Inicio</NavLink>
          <NavLink to="/productos" className={linkCls}>Productos</NavLink>
          <NavLink to="/nosotros" className={linkCls}>Nosotros</NavLink>
          <NavLink to="/contacto" className={linkCls}>Contacto</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          {/* Carrito */}
          <Link to="/carrito" className="relative group" aria-label="Ir al carrito">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-700 group-hover:text-brand-dark transition">
              <path d="M7 6h14l-1.5 9h-11z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="9" cy="20" r="1.5" fill="currentColor"/>
              <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
              <path d="M7 6 5 3H2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[11px] leading-[18px] text-center"
                aria-label={`${cartCount} productos en el carrito`}
              >
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {!user ? (
            <Link
              to="/login"
              className="hidden sm:inline-block px-3 py-1.5 rounded-xl2 bg-brand text-white font-medium"
            >
              Ingresar
            </Link>
          ) : (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenu(v => !v)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl2 border border-surface-hard bg-white hover:shadow focus:outline-none focus:ring-2 focus:ring-brand/30"
                aria-expanded={userMenu}
                aria-haspopup="menu"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-dark" aria-hidden="true">
                  <circle cx="12" cy="8" r="3" fill="currentColor" />
                  <path d="M4 20c1.5-4 14.5-4 16 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="max-w-[140px] truncate">{user.name || user.email}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>

              {userMenu && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl2 border border-surface-hard bg-white shadow-lg overflow-hidden"
                  role="menu"
                >
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 text-sm hover:bg-surface-soft" role="menuitem">
                      Panel Admin
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-soft"
                    role="menuitem"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Botón mobile */}
          <button
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-surface-hard bg-white focus:outline-none focus:ring-2 focus:ring-brand/30"
            onClick={() => setOpen(v => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-neutral-800">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Menú mobile */}
      {open && (
        <div
          id="mobile-menu"
          ref={mobileRef}
          className="md:hidden border-t border-surface-hard bg-white/95 backdrop-blur"
        >
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-3 grid gap-2">
            <NavLink to="/" className={linkCls}>Inicio</NavLink>
            <NavLink to="/productos" className={linkCls}>Productos</NavLink>
            <NavLink to="/nosotros" className={linkCls}>Nosotros</NavLink>
            <NavLink to="/contacto" className={linkCls}>Contacto</NavLink>
            {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}

            {!user ? (
              <Link
                to="/login"
                className="mt-2 px-3 py-2 rounded-xl2 bg-brand text-white text-center"
              >
                Ingresar
              </Link>
            ) : (
              <button
                onClick={logout}
                className="mt-2 px-3 py-2 rounded-xl2 border border-surface-hard bg-white text-left"
              >
                Cerrar sesión
              </button>
            )}
          </div>
          {/* safe-area para iPhone con notch */}
          <div className="pb-[env(safe-area-inset-bottom)]" />
        </div>
      )}
    </nav>
  )
}
