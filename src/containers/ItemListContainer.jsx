import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getProducts } from "../lib/api.js";

export default function ItemListContainer() {
  const { categoryId } = useParams();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    getProducts(categoryId)
      .then((list) => { setItems(list); setStatus("ok"); })
      .catch(() => setStatus("error"));
  }, [categoryId]);

  if (status === "loading") return <p className="muted">Cargando productos…</p>;
  if (status === "error") return <p className="muted">Error cargando el catálogo.</p>;

  return (
    <section className="section">
      <h1 className="section-title">
        {categoryId ? `Productos: ${categoryId}` : "Catálogo Distrimax"}
      </h1>

      <div className="grid">
        {items.map((it) => (
          <article key={it.id} className="card" style={{ position: "relative" }}>
            {/* Overlay: toda la card clickeable */}
            <Link
              to={`/item/${it.id}`}
              aria-label={`Ver detalle de ${it.nombre}`}
              style={{ position: "absolute", inset: 0, zIndex: 3 }}
            />

            <div className="card-media" style={{ position: "relative", zIndex: 2 }}>
              {it.img ? (
                <img src={it.img} alt={it.nombre} />
              ) : (
                <div className="card-placeholder"><span>Sin imagen</span></div>
              )}
            </div>

            <div className="card-body" style={{ position: "relative", zIndex: 2 }}>
              <h4 className="card-title" style={{ marginBottom: 8 }}>
                {it.nombre}
              </h4>

              {typeof it.precio === "number" && (
                <p className="card-price" style={{ marginBottom: 12 }}>
                  $ {it.precio.toLocaleString("es-AR")}
                </p>
              )}

              {/* Botón por encima del overlay */}
              <div style={{ position: "relative", zIndex: 4 }}>
                <Link to={`/item/${it.id}`} className="btn-primary">
                  Ver detalle
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
