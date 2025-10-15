// src/components/Navbar.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../assets/logo-transparente.png'
import { useAuth } from '../auth/AuthContext.jsx'
import { useCart } from '../context/CartContext.jsx'

const linkCls = ({ isActive }) =>
  isActive
    ? 'text-brand-dark font-semibold'
    : 'text-neutral-700 hover:text-brand-dark'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { items } = useCart()
  const [open, setOpen] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const loc = useLocation()

  // cierra menús al navegar
  useEffect(() => { setOpen(false); setUserMenu(false) }, [loc.pathname])

  const cartCount = useMemo(
    () => (items || []).reduce((acc, it) => acc + Number(it.qty || 0), 0),
    [items]
  )

  return (
    <nav className="sticky top-0 z-50 border-b border-surface-hard bg-white/80 backdrop-blur">
      {/* glow brand sutil */}
      <div className="absolute inset-x-0 -top-10 h-10 pointer-events-none bg-gradient-to-b from-brand/10 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="Distrimax" className="h-9 w-auto" />
            <span className="hidden sm:block font-bold tracking-tight">Distrimax</span>
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={linkCls}>Inicio</NavLink>
          <NavLink to="/productos" className={linkCls}>Productos</NavLink>
          <NavLink to="/nosotros" className={linkCls}>Nosotros</NavLink>
          <NavLink to="/contacto" className={linkCls}>Contacto</NavLink>
          {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {/* Carrito */}
          <Link to="/carrito" className="relative group">
            <svg viewBox="0 0 24 24" className="h-6 w-6 text-neutral-700 group-hover:text-brand-dark transition">
              <path d="M7 6h14l-1.5 9h-11z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="9" cy="20" r="1.5" fill="currentColor"/>
              <circle cx="18" cy="20" r="1.5" fill="currentColor"/>
              <path d="M7 6 5 3H2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-white text-[11px] leading-[18px] text-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {!user ? (
            <Link to="/login" className="hidden sm:inline-block px-3 py-1.5 rounded-xl2 bg-brand text-white font-medium">
              Ingresar
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setUserMenu(v => !v)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl2 border border-surface-hard bg-white hover:shadow"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 text-brand-dark">
                  <circle cx="12" cy="8" r="3" fill="currentColor" />
                  <path d="M4 20c1.5-4 14.5-4 16 0" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
                <span className="max-w-[120px] truncate">{user.name || user.email}</span>
                <svg viewBox="0 0 24 24" className="h-4 w-4 text-neutral-500">
                  <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </button>

              {userMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl2 border border-surface-hard bg-white shadow-lg overflow-hidden">
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 text-sm hover:bg-surface-soft">Panel Admin</Link>
                  )}
                  <button
                    onClick={logout}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-surface-soft"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-lg border border-surface-hard bg-white"
            onClick={() => setOpen(v => !v)}
            aria-label="Abrir menú"
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

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-surface-hard bg-white/95 backdrop-blur">
          <div className="max-w-6xl mx-auto px-4 py-3 grid gap-2">
            <NavLink to="/" className={linkCls}>Inicio</NavLink>
            <NavLink to="/productos" className={linkCls}>Productos</NavLink>
            <NavLink to="/nosotros" className={linkCls}>Nosotros</NavLink>
            <NavLink to="/contacto" className={linkCls}>Contacto</NavLink>
            {isAdmin && <NavLink to="/admin" className={linkCls}>Admin</NavLink>}
            {!user ? (
              <Link to="/login" className="mt-2 px-3 py-2 rounded-xl2 bg-brand text-white text-center">
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
        </div>
      )}
    </nav>
  )
}
