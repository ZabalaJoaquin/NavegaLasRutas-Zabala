export default function ProductCard({ nombre, precio, img, onAdd }) {
//Cartas de productos / Agregar al carrito / Precio / Imagen / Nombre / 
  return (
    <article className="card">
      <div className="card-media">
        {img ? <img src={img} alt={nombre} /> : <div className="card-placeholder"><span>Foto próximamente</span></div>}
      </div>
      <div className="card-body">
        <h4 className="card-title">{nombre}</h4>
        {typeof precio === "number" && <p className="card-price">$ {precio.toLocaleString("es-AR")}</p>}
        <button className="btn-primary" type="button" onClick={() => onAdd?.()}>
          Agregar al carrito
        </button>
      </div>
    </article>
  );
}
