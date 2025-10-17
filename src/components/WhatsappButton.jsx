// src/components/WhatsappButton.jsx
export default function WhatsappButton() {
  const phone = "+5492625458035"
  const message = "Hola! Quisiera consultar sobre sus productos."
  const url = `https://wa.me/${phone}/?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 right-6 group z-50">
      {/* Animación suave tipo pulso */}
      <div className="absolute inset-0 rounded-full bg-green-500 opacity-40 animate-ping"></div>

      {/* Botón principal */}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        title="Escribinos por WhatsApp"
        className="relative bg-green-500 hover:bg-green-600 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center justify-center"
      >
        {/* Ícono de WhatsApp */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-7 w-7"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M16.988 14.422c-.272-.136-1.61-.794-1.86-.884-.25-.09-.433-.136-.616.136-.183.272-.708.884-.867 1.067-.159.183-.318.204-.59.068-.272-.136-1.148-.423-2.188-1.35-.809-.721-1.355-1.61-1.514-1.882-.159-.272-.017-.419.12-.555.123-.123.272-.318.409-.477.136-.159.183-.272.272-.454.09-.183.045-.34-.022-.477-.068-.136-.616-1.488-.845-2.039-.222-.532-.448-.46-.616-.468-.159-.007-.34-.009-.522-.009s-.477.068-.727.34c-.25.272-.955.933-.955 2.275 0 1.342.977 2.637 1.113 2.818.136.181 1.925 2.94 4.661 4.124.651.28 1.159.447 1.555.573.654.208 1.25.179 1.722.108.525-.078 1.61-.658 1.839-1.293.226-.636.226-1.18.158-1.293-.067-.113-.25-.181-.522-.317zM12.007 2C6.48 2 2 6.375 2 11.844c0 2.103.662 4.057 1.79 5.672L2 22l4.657-1.744A10.003 10.003 0 0 0 12.007 22c5.527 0 10.007-4.375 10.007-9.844S17.534 2 12.007 2z" />
        </svg>
      </a>

      {/* Tooltip */}
      <div className="absolute right-16 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-neutral-800 text-white text-sm px-3 py-1 rounded-xl2 shadow-lg transition-opacity duration-300 whitespace-nowrap">
        💬 Chateá con nosotros
      </div>
    </div>
  )
}
