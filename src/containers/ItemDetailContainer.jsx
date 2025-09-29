import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getProductById } from "../lib/api.js";

function ItemCount({ initial = 1, min = 1, max = 99, onAdd = () => {} }) {
  const [qty, setQty] = useState(initial);
  const dec = () => setQty((q) => Math.max(min, q - 1));
  const inc = () => setQty((q) => Math.min(max, q + 1));
  return (
    <div style={{ display: "grid", gridAutoFlow: "column", gap: 8, alignItems: "center", marginTop: 12 }}>
      <button className="btn-primary" type="button" onClick={dec}>−</button>
      <span style={{ minWidth: 28, textAlign: "center" }}>{qty}</span>
      <button className="btn-primary" type="button" onClick={inc}>+</button>
      <button className="btn-primary" type="button" onClick={() => onAdd(qty)}>Agregar al carrito</button>
    </div>
  );
}

export default function ItemDetailContainer({ onAddToCart = () => {} }) {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
    getProductById(id)
      .then((p) => { setItem(p); setStatus(p ? "ok" : "notfound"); })
      .catch(() => setStatus("error"));
  }, [id]);

  if (status === "loading") return <p className="muted">Cargando detalle…</p>;
  if (status === "error") return <p className="muted">No se pudo cargar el producto.</p>;
  if (status === "notfound" || !item) return <p className="muted">Producto no encontrado.</p>;

  const handleAdd = (qty) => onAddToCart(qty);

  return (
    <section className="section">
      <div className="card" style={{ padding: 16 }}>
        <div className="card-media" style={{ maxWidth: 560, margin: "0 auto" }}>
          {item.img ? <img src={item.img} alt={item.nombre} /> : <div className="card-placeholder"><span>Sin imagen</span></div>}
        </div>
        <div className="card-body">
          <h2 className="card-title">{item.nombre}</h2>
          {typeof item.precio === "number" && <p className="card-price" style={{ fontSize: "1.25rem" }}>$ {item.precio.toLocaleString("es-AR")}</p>}
          {item.desc && <p className="card-text" style={{ marginTop: 8 }}>{item.desc}</p>}
          <ItemCount initial={1} min={1} max={20} onAdd={handleAdd} />
        </div>
      </div>
    </section>
  );
}
