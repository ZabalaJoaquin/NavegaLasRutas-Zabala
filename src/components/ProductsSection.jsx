import ProductCard from "./ProductCard.jsx";

export default function ProductsSection({
  id = "productos",
  vinos = [],
  champagnes = [],
  gaseosas = [],
  onAddToCart = () => {},
}) {
  return (
    <section id={id} className="section">
      <h2 className="section-title">Productos</h2>
      <p className="section-subtitle">
        Selección destacada de nuestro catálogo.Pedidos para comercios y mayoristas.
      </p>

      <div className="section-block" id="vinos">
        <h3 className="block-title">Vinos</h3>
        <div className="grid">
          {vinos.length === 0 && <p className="muted">Subí imágenes a <code>src/assets/vinos</code>.</p>}
          {vinos.map((item) => (
            <ProductCard key={item.id} {...item} onAdd={onAddToCart} />
          ))}
        </div>
      </div>

      <div className="section-block" id="champagne">
        <h3 className="block-title">Champagne</h3>
        <div className="grid">
          {champagnes.length === 0 && <p className="muted">Subí imágenes a <code>src/assets/champagne</code>.</p>}
          {champagnes.map((item) => (
            <ProductCard key={item.id} {...item} onAdd={onAddToCart} />
          ))}
        </div>
      </div>
      <div className="section-block" id="gaseosas">
        <h3 className="block-title">Gaseosa Agua Baggio</h3>
        <div className="grid">
          {gaseosas.length === 0 && <p className="muted">Subí imágenes a <code>src/assets/gaseosas</code>.</p>}
          {gaseosas.map((item) => (
            <ProductCard key={item.id} {...item} onAdd={onAddToCart} />
          ))}
        </div>
      </div>

    </section>
  );
}
