import { Link } from 'react-router-dom'

export default function Footer(){
  return (
    <footer className="mt-16 border-t border-surface-hard bg-surface-soft">
      <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h3 className="font-semibold mb-2 text-brand-dark">Distrimax</h3>
          <p className="text-neutral-600">Distribuidora de bebidas — General Alvear, Mendoza.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Secciones</h4>
          <ul className="space-y-1">
            <li><Link to="/productos" className="hover:underline">Productos</Link></li>
            <li><Link to="/carrito" className="hover:underline">Carrito</Link></li>
            <li><Link to="/checkout" className="hover:underline">Checkout</Link></li>
            <li><Link to="/nosotros" className="hover:underline">Nosotros</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Redes</h4>
          <ul className="space-y-1">
            <li><a href="https://www.instagram.com/distrimax_sa/" target="_blank" className="hover:underline" rel="noreferrer">Instagram</a></li>
            <li><a href="https://maps.app.goo.gl/2D7AenDTa6tg4tr79" target="_blank" className="hover:underline" rel="noreferrer">Google Maps</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">Contacto</h4>
          <p className="text-neutral-600">Usá el formulario o escribinos por Instagram.</p>
        </div>
      </div>
      <div className="text-xs text-neutral-500 py-4 border-t border-surface-hard text-center">
        © {new Date().getFullYear()} Distrimax. Todos los derechos reservados.
      </div>
    </footer>
  )
}
