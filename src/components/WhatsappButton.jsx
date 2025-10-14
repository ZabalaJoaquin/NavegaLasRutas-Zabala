export default function WhatsappButton(){
  const phone = import.meta.env.VITE_WHATSAPP_PHONE || ''
  const url = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-4 right-4 rounded-full bg-brand text-white shadow-soft px-4 py-3 text-sm font-semibold"
      title="Escribinos por WhatsApp"
    >
      WhatsApp
    </a>
  )
}
