import ProductCard from "./ProductCard.jsx";

export default function ProductsSection({
  id = "productos",
  vinos = [],
  champagnes = [],
  aguas = [],
  onAddToCart = () => {},
}) {
  return (
    <section id={id} className="section">
      <h2 className="section-title">Productos</h2>
      <p className="section-subtitle">
        Selección del catálogo Distrimax. Pedidos para comercios y mayoristas.
      </p>

      {/* Vinos */}
      <div className="section-block" id="vinos">
        <h3 className="block-title">Vinos</h3>
        <div className="grid">
          {vinos.length === 0 && <p className="muted">Cargá imágenes en <code>src/assets/vinos</code>.</p>}
          {vinos.map(item => <ProductCard key={item.id} {...item} onAdd={onAddToCart} />)}
        </div>
      </div>

      {/* Champagne */}
      <div className="section-block" id="champagne">
        <h3 className="block-title">Champagne</h3>
        <div className="grid">
          {champagnes.length === 0 && <p className="muted">Cargá imágenes en <code>src/assets/champagne</code>.</p>}
          {champagnes.map(item => <ProductCard key={item.id} {...item} onAdd={onAddToCart} />)}
        </div>
      </div>

      {/* Aguas / Saborizadas */}
      <div className="section-block" id="aguas">
        <h3 className="block-title">Aguas saborizadas</h3>
        <div className="grid">
          {aguas.length === 0 && <p className="muted">Cargá imágenes en <code>src/assets/aguas</code>.</p>}
          {aguas.map(item => <ProductCard key={item.id} {...item} onAdd={onAddToCart} />)}
        </div>
      </div>
    </section>
  );
}
