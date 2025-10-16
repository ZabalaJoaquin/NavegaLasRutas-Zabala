// src/routes/About.jsx
import React from "react"
import { Link } from "react-router-dom"
import Brands from "../components/Brands.jsx"

export default function About() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-brand-dark">Sobre Distrimax</h1>
        <p className="text-lg text-neutral-700">
          Somos <strong>Distrimax</strong>, una distribuidora de bebidas de <strong>General Alvear, Mendoza</strong>,
          creada y gestionada por los hermanos <strong>Zabala</strong>.  
          Nacimos con la idea de brindar un servicio de cercanía, rápido y confiable, conectando
          a comercios, eventos y particulares con las mejores marcas del país.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-dark">Nuestros servicios</h2>
          <ul className="list-disc list-inside space-y-2 text-neutral-700">
            <li><strong>🚚 Envíos a domicilio:</strong> entregamos tus productos directamente en tu negocio o evento, rápido y seguro.</li>
            <li><strong>🤝 Preventistas:</strong> enviamos un representante para conocer tus necesidades y asesorarte personalmente.</li>
            <li><strong>💡 Asesoramiento de compra:</strong> te ayudamos a elegir las mejores bebidas para tu tipo de negocio o cliente.</li>
            <li><strong>📦 Preparación de pedidos:</strong> cada pedido se arma cuidadosamente para garantizar calidad y cumplimiento.</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-brand-dark">Nuestra misión</h2>
          <p>
            Ofrecer una experiencia de compra simple, ágil y confiable,
            con precios competitivos, marcas reconocidas y atención personalizada.
          </p>

          <h2 className="text-2xl font-semibold text-brand-dark">Nuestra visión</h2>
          <p>
            Ser la <strong>distribuidora familiar líder en el sur mendocino</strong>,
            reconocida por su cercanía, responsabilidad y trato humano.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-brand-dark">Marcas que representamos</h2>
        <p className="text-neutral-700">
          Somos distribuidores oficiales de <strong>Branca, Bagioo, Rosamonte, Campari, Citric</strong> y
          <strong> Los Haroldos</strong>, entre muchas otras marcas líderes del mercado.
        </p>
        <Brands />
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-brand-dark">Nuestros valores</h2>
        <ul className="list-disc list-inside space-y-1 text-neutral-700">
          <li><strong>Cercanía:</strong> el contacto directo y humano sigue siendo nuestra prioridad.</li>
          <li><strong>Confianza:</strong> cumplimos lo que prometemos.</li>
          <li><strong>Responsabilidad:</strong> cuidamos tu tiempo y tu negocio.</li>
          <li><strong>Familia:</strong> trabajamos juntos, con los valores que nos enseñaron desde siempre.</li>
        </ul>
      </div>

      <div className="text-center pt-8">
        <Link to="/productos" className="inline-block mt-4 px-6 py-3 bg-brand text-white rounded-xl2 font-semibold hover:opacity-90">
          Ver catálogo
        </Link>
      </div>
    </section>
  )
}
