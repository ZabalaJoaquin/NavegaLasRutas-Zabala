// src/components/Footer.jsx
import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-16 bg-neutral-900 text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-10 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <h3 className="font-semibold mb-2 text-white">Distrimax</h3>
          <p className="text-neutral-300">
            Distribuidora de bebidas — General Alvear, Mendoza.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Secciones</h4>
          <ul className="space-y-1">
            <li><Link to="/productos" className="hover:underline">Productos</Link></li>
            <li><Link to="/carrito" className="hover:underline">Carrito</Link></li>
            <li><Link to="/checkout" className="hover:underline">Checkout</Link></li>
            <li><Link to="/nosotros" className="hover:underline">Nosotros</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Redes</h4>
          <ul className="space-y-1">
            <li>
              <a
                href="https://www.instagram.com/distrimax_sa/"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://maps.app.goo.gl/2D7AenDTa6tg4tr79"
                target="_blank"
                rel="noreferrer"
                className="hover:underline"
              >
                Google Maps
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-2 text-white">Contacto</h4>
          <p className="text-neutral-300">Usá el formulario o escribinos por Instagram.</p>
        </div>
      </div>

      <div className="text-xs text-neutral-400 py-4 border-t border-neutral-800 text-center">
        © {year} Distrimax. Todos los derechos reservados.
      </div>
    </footer>
  )
}
