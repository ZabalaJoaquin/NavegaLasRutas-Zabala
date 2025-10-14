import bg from '../assets/logo-fondo.jpg'
import { Link } from 'react-router-dom'

export default function Hero(){
  return (
    <section className="relative overflow-hidden">
      <img src={bg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-95 pointer-events-none select-none"/>
      <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
        <div className="glass rounded-xl2 p-6 md:p-10 shadow-soft ring-brand">
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight text-brand-dark">Distrimax</h1>
          <p className="mt-3 text-lg text-neutral-800">Distribuidora de bebidas de General Alvear, Mendoza. Mayorista y minorista, con entrega ágil y atención cercana.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/productos" className="px-5 py-3 rounded-xl2 bg-brand text-white font-semibold shadow-soft hover:bg-brand-dark transition">Ver Productos</Link>
            <a href="https://www.instagram.com/distrimax_sa/" target="_blank" rel="noreferrer" className="px-5 py-3 rounded-xl2 border border-brand-dark text-brand-dark font-semibold hover:bg-white/60">Instagram</a>
          </div>
          <p className="text-xs text-neutral-700 mt-3">Cobertura: General Alvear y zonas cercanas.</p>
        </div>
        <ul className="grid grid-cols-2 gap-3">
          {[
            ['Gaseosas','/prod/coca.svg'],
            ['Aguas','/prod/agua.svg'],
            ['Cervezas','/prod/quilmes.svg'],
            ['Vinos','/prod/vino.svg'],
            ['Energizantes','/prod/speed.svg'],
          ].map(([label, src]) => (
            <li key={label} className="bg-white/90 backdrop-blur rounded-xl2 p-5 shadow-soft flex items-center gap-4">
              <img src={src} alt="" className="w-14 h-14"/>
              <span className="font-medium">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
