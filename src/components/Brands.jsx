const brands = [
  { name: 'Baggio', url: '#'},
  { name: 'Branca', url: '#'},
  { name: 'Citric', url: '#'},
  { name: 'Speed', url: '#'},
  { name: 'Los Haroldos', url: '#'},
]

export default function Brands(){
  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6">Distribuidores oficiales de:</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
        {brands.map(b => (
          <a key={b.name} href={b.url} className="rounded-xl2 border border-surface-hard bg-white/90 p-4 text-center hover:shadow-soft">
            <div className="w-16 h-16 mx-auto rounded-full border border-surface-hard flex items-center justify-center text-brand-dark text-xl font-bold">{b.name[0]}</div>
            <div className="mt-2 text-sm">{b.name}</div>
          </a>
        ))}
      </div>
    </section>
  )
}
