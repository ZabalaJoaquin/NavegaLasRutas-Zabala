import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listOrdersForAdmin, adminUpdateOrderStatus } from "../services/products";

const STATES = ["pedidos","preparado","entregado"];

export default function AdminOrders() {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const data = await listOrdersForAdmin({ status: status || undefined });
      setOrders(data);
    })();
  }, [status]);

  if (!isAdmin) return <p className="container">No autorizado.</p>;

  const advance = async (id, current) => {
    setMsg("");
    const next = current === "pedidos" ? "preparado" : current === "preparado" ? "entregado" : "entregado";
    await adminUpdateOrderStatus(id, next);
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: next } : o));
    setMsg(`Pedido ${id} → ${next}`);
  };

  return (
    <section className="container">
      <h1>Pedidos</h1>
      <div className="row" style={{ gap: 8, marginBottom: 8 }}>
        <label style={{ minWidth: 220 }}>
          Estado
          <select value={status} onChange={e=>setStatus(e.target.value)}>
            <option value="">Todos</option>
            {STATES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
        {orders.map(o => (
          <div key={o.id} className="card">
            <div className="space-between">
              <strong>#{o.id}</strong>
              <span className={`badge ${o.status}`}>{o.status}</span>
            </div>
            <ul>
              {o.items?.map(it => <li key={it.id}>{it.title} x{it.qty} — ${it.price}</li>)}
            </ul>
            <div className="space-between">
              <div>Total: <b>${o.total}</b></div>
              {o.status !== "entregado" && (
                <button className="btn btn-primary" onClick={() => advance(o.id, o.status)}>Avanzar estado</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </section>
  );
}
