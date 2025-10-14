import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { getProducts, setProductPriceStock } from "../services/products";
import { seedDistrimax } from "../services/seed";

export default function AdminDashboard() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState([]);
  const [msg,setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const p = await getProducts();
      setProducts(p);
    })();
  }, []);

  if (!isAdmin) return <p className="container">No autorizado.</p>;

  const onSave = async (id, price, stock) => {
    setMsg("");
    await setProductPriceStock(id, { price: Number(price), stock: Number(stock) });
    setMsg("Guardado.");
  };

  const onSeed = async () => {
    const n = await seedDistrimax();
    const p = await getProducts();
    setProducts(p);
    setMsg(`Catálogo Distrimax cargado (${n} items).`);
  };

  return (
    <section className="container">
      <h1>Productos</h1>
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <button className="btn" onClick={onSeed}>Cargar catálogo Distrimax</button>
      </div>
      {msg && <p>{msg}</p>}
      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {products.map(p => (
          <div key={p.id} className="card">
            <strong>{p.title}</strong>
            <div className="row" style={{ gap: 8, marginTop: 8 }}>
              <input type="number" placeholder="Precio" defaultValue={p.price ?? ""} id={`price-${p.id}`} />
              <input type="number" placeholder="Stock" defaultValue={p.stock ?? ""} id={`stock-${p.id}`} />
              <button className="btn btn-primary" onClick={() => {
                const price = document.getElementById(`price-${p.id}`).value;
                const stock = document.getElementById(`stock-${p.id}`).value;
                onSave(p.id, price, stock);
              }}>Guardar</button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
