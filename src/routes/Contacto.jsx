import MapEmbed from '../components/MapEmbed.jsx'

export default function Contacto(){
  return (
    <section className="max-w-4xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Contacto</h1>
        <form action="https://formsubmit.co/" method="POST" className="space-y-3">
          <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" name="name" placeholder="Nombre" required />
          <input className="w-full border border-surface-hard rounded-xl2 px-3 py-2" name="email" type="email" placeholder="Email" required />
          <textarea className="w-full border border-surface-hard rounded-xl2 px-3 py-2" name="message" rows="4" placeholder="Mensaje"></textarea>
          <button className="px-4 py-2 rounded-xl2 bg-brand text-white font-semibold">Enviar</button>
        </form>
        <p className="text-sm text-neutral-600 mt-3">También podés escribirnos por <a className="underline" href="https://www.instagram.com/distrimax_sa/" target="_blank" rel="noreferrer">Instagram</a>.</p>
      </div>
      <div>
        <MapEmbed />
        <p className="text-xs text-neutral-600 mt-2">Mapa de referencia · Google Maps</p>
      </div>
    </section>
  )
}
