import { Link } from "react-router-dom";

export default function ProductCard({
  id,
  img,
  nombre,
  precio,
  onAdd = () => {},
}) {
  return (
    <article className="card" style={{ position: "relative" }}>
      {/* Overlay SOLO arriba (imagen y título), no cubre acciones */}
      <Link
        to={`/item/${id}`}
        aria-label={`Ver detalle de ${nombre}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: "60px", // dejamos libre el espacio inferior (acciones)
          zIndex: 1,
        }}
      />

      <div className="card-media" style={{ position: "relative", zIndex: 2 }}>
        {img ? (
          <img src={img} alt={nombre} />
        ) : (
          <div className="card-placeholder"><span>Sin imagen</span></div>
        )}
      </div>

      <div className="card-body" style={{ position: "relative", zIndex: 2 }}>
        <h4 className="card-title" style={{ marginBottom: 8 }}>{nombre}</h4>

        {typeof precio === "number" && (
          <p className="card-price" style={{ marginBottom: 12 }}>
            $ {precio.toLocaleString("es-AR")}
          </p>
        )}

        <div
          className="card-actions"
          style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}
        >
          <button
            className="btn-primary"
            type="button"
            onClick={() => onAdd({ id, nombre, precio })}
          >
            Agregar
          </button>

          {/* Ahora el link es visible como botón */}
          <Link to={`/item/${id}`} className="btn-primary">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}
