<footer className="mt-16 border-t border-brand-dark bg-brand text-white">
  <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
    <div>
      <h3 className="font-semibold mb-2 text-white">Distrimax</h3>
      <p className="text-white/80 leading-relaxed">
        Distribuidora de bebidas en General Alvear, Mendoza. Calidad y servicio en cada entrega.
      </p>
    </div>
    <div>
      <h4 className="font-semibold mb-2 text-white">Secciones</h4>
      <ul className="space-y-1">
        <li><Link to="/productos" className="hover:underline text-white/90">Productos</Link></li>
        <li><Link to="/carrito" className="hover:underline text-white/90">Carrito</Link></li>
        <li><Link to="/checkout" className="hover:underline text-white/90">Checkout</Link></li>
        <li><Link to="/nosotros" className="hover:underline text-white/90">Nosotros</Link></li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-2 text-white">Redes</h4>
      <ul className="space-y-1">
        <li><a href="https://www.instagram.com/distrimax_sa/" target="_blank" rel="noreferrer" className="hover:underline text-white/90">Instagram</a></li>
        <li><a href="https://wa.me/+5492625458035/?text=Hola!%20Quisiera%20consultar%20sobre%20sus%20productos." target="_blank" rel="noreferrer" className="hover:underline text-white/90">WhatsApp</a></li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold mb-2 text-white">Contacto</h4>
      <p className="text-white/80 leading-relaxed">
        Envíos a domicilio y atención personalizada. Familia Zabala — Distrimax.
      </p>
    </div>
  </div>
  <div className="text-xs text-white/70 py-5 border-t border-white/20 text-center">
    © {new Date().getFullYear()} Distrimax · Todos los derechos reservados
  </div>
</footer>
