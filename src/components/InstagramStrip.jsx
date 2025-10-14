// Tiras clicables a Instagram (placeholders) para no depender de API.
const links = [
  'https://www.instagram.com/distrimax_sa/',
  'https://www.instagram.com/distrimax_sa/',
  'https://www.instagram.com/distrimax_sa/',
  'https://www.instagram.com/distrimax_sa/',
  'https://www.instagram.com/distrimax_sa/',
]

export default function InstagramStrip(){
  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Estamos en Instagram</h2>
        <a className="text-brand-dark underline" href="https://www.instagram.com/distrimax_sa/" target="_blank" rel="noreferrer">@distrimax_sa</a>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {links.map((href, i) => (
          <a key={i} href={href} target="_blank" rel="noreferrer" className="aspect-square rounded-xl2 bg-surface-soft border border-surface-hard hover:shadow-soft overflow-hidden">
            <div className="w-full h-full flex items-center justify-center text-neutral-500">Post</div>
          </a>
        ))}
      </div>
    </section>
  )
}
