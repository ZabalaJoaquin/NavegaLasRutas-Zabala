import { useState } from 'react'

const brands = [
  { key: 'baggio',      name: 'Baggio',       url: '#', logo: '/brands/baggio.png' },
  { key: 'branca',      name: 'Branca',       url: '#', logo: '/brands/branca.png' },
  { key: 'citric',      name: 'Citric',       url: '#', logo: '/brands/citric.png' },
  { key: 'speed',       name: 'Speed',        url: '#', logo: '/brands/speed.png' },
  { key: 'losharoldos', name: 'Los Haroldos', url: '#', logo: '/brands/losharoldos.png' },
]

function BrandLogo({ name, logo }) {
  const [error, setError] = useState(false)
  if (!logo || error) {
    return (
      <div className="w-16 h-16 mx-auto rounded-full border border-surface-hard grid place-items-center bg-white text-brand-dark text-xl font-bold">
        {name?.[0] || '?'}
      </div>
    )
  }
  return (
    <img
      src={logo}
      alt={name}
      className="h-12 w-auto mx-auto object-contain filter grayscale hover:grayscale-0 transition"
      onError={() => setError(true)}
      loading="lazy"
    />
  )
}

export default function Brands(){
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-1">Distribuidores oficiales de:</h2>
      <p className="text-sm text-neutral-600 mb-6">
        Trabajamos con marcas líderes del mercado para garantizar calidad y disponibilidad.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map(b => (
          <a
            key={b.key}
            href={b.url}
            target={b.url && b.url !== '#' ? '_blank' : undefined}
            rel={b.url && b.url !== '#' ? 'noopener noreferrer' : undefined}
            className="group relative overflow-hidden rounded-xl2 border border-surface-hard bg-white/90 p-4 text-center hover:shadow-soft transition"
            aria-label={`Marca ${b.name}`}
          >
            {/* borde-destello sutil en hover */}
            <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition">
              <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-transparent to-brand/10" />
            </div>

            <BrandLogo name={b.name} logo={b.logo} />
            <div className="mt-2 text-sm font-medium">{b.name}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
