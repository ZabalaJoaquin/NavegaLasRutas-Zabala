export default function ItemListContainer({ greeting }) {
  return (
    <section className="hero">
      <h1 className="hero-title">{greeting}</h1>
      <p className="hero-subtitle">
        Catálogo de bebidas: aguas, gaseosas, energizantes, cervezas, vinos y más.
      </p>
    </section>
  );
}
