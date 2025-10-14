export default function MapEmbed(){
  const src = "https://www.google.com/maps?q=Distrimax%20General%20Alvear%20Mendoza&output=embed"
  return (
    <div className="aspect-video w-full rounded-xl2 overflow-hidden border border-surface-hard">
      <iframe title="Mapa Distrimax" src={src} className="w-full h-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
    </div>
  )
}
