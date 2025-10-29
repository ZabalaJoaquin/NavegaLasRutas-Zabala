import { Link } from 'react-router-dom'

export default function NotFound(){
  return (
    <section className="max-w-3xl mx-auto px-6 py-16 text-center">
      <h1 className="text-3xl font-extrabold">Página no encontrada</h1>
      <p className="mt-2 text-neutral-700">La ruta que intentaste abrir no existe.</p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link to="/" className="px-4 py-2 rounded-xl2 bg-brand text-white">Volver al inicio</Link>
        <Link to="/productos" className="px-4 py-2 rounded-xl2 border border-surface-hard">Ver productos</Link>
      </div>
    </section>
  )
}
