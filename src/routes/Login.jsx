// src/routes/Login.jsx
import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'
import logo from '../assets/logo-transparente.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true); setError('')
    const res = await login({ email, password })
    if (res.ok) navigate(from, { replace: true })
    else setError(res.error || 'No se pudo iniciar sesión')
    setBusy(false)
  }

  return (
    <section className="relative min-h-[calc(100vh-120px)] grid place-items-center overflow-hidden">
      {/* Fondo con “luces” brand */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand/10 via-transparent to-brand/10" />
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-brand/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand/20 blur-3xl" />

      <div className="relative w-full max-w-md mx-auto px-4">
        <div className="rounded-2xl border border-surface-hard/60 bg-white/80 backdrop-blur shadow-xl">
          <div className="px-6 pt-6 pb-2 text-center">
            <img src={logo} alt="Distrimax" className="mx-auto h-16 object-contain" />
            <h1 className="mt-3 text-2xl font-bold tracking-tight">
              Ingresá a <span className="text-brand-dark">Distrimax</span>
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              Clientes registrados pueden ver precios y comprar.
            </p>
          </div>

          <form onSubmit={onSubmit} className="px-6 pb-6 space-y-3">
            {/* Email */}
            <label className="block">
              <span className="text-sm text-neutral-700">Correo electrónico</span>
              <div className="mt-1 relative">
                <input
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  className="w-full rounded-xl2 border border-surface-hard bg-white px-3 py-2 pl-9 outline-none focus:ring-2 focus:ring-brand/40"
                  placeholder="tu@email.com"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
            </label>

            {/* Contraseña */}
            <label className="block">
              <span className="text-sm text-neutral-700">Contraseña</span>
              <div className="mt-1 relative">
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  className="w-full rounded-xl2 border border-surface-hard bg-white px-3 py-2 pl-9 pr-12 outline-none focus:ring-2 focus:ring-brand/40"
                  placeholder="••••••••"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400" viewBox="0 0 24 24" fill="none">
                  <path d="M12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
                <button
                  type="button"
                  onClick={()=>setShow(s=>!s)}
                  className="absolute right-2 top-1.5 rounded-md px-2 py-1 text-xs border border-surface-hard bg-white hover:bg-surface-soft"
                >
                  {show ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </label>

            {error && (
              <div className="rounded-xl2 border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl2 bg-brand text-white font-semibold px-4 py-2 hover:opacity-95 active:opacity-90 transition disabled:opacity-60"
            >
              {busy && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8v4A4 4 0 0 0 8 12H4z"></path>
                </svg>
              )}
              Ingresar
            </button>

            <div className="flex items-center justify-between text-xs text-neutral-600 mt-2">
              <span>¿No tenés usuario?</span>
              <span>Solicitalo al administrador.</span>
            </div>

            <div className="text-center mt-2">
              <Link to="/" className="text-xs text-brand-dark hover:underline">
                Volver al inicio
              </Link>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
