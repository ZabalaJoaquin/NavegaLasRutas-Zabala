import { db } from "../firebase/config";
import {
  collection, getDocs, query, where, doc, getDoc,
  addDoc, serverTimestamp, writeBatch, updateDoc, orderBy, setDoc
} from "firebase/firestore";

const productsCol = collection(db, "products");
const pricesCol = collection(db, "productPrices");
const ordersCol  = collection(db, "orders");

async function attachPrices(prodList) {
  try {
    const ids = new Set(prodList.map(p => p.id));
    const snaps = await getDocs(pricesCol);
    const prices = {};
    snaps.forEach(d => { if (ids.has(d.id)) prices[d.id] = d.data(); });
    return prodList.map(p => ({ ...p, ...(prices[p.id] || {}) }));
  } catch { return prodList; }
}

export async function getProducts({ category } = {}) {
  const q = category ? query(productsCol, where("category", "==", category)) : productsCol;
  const snap = await getDocs(q);
  const base = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return attachPrices(base);
}

export async function getProductById(id) {
  const ref = doc(db, "products", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Producto no encontrado");
  const base = { id: snap.id, ...snap.data() };
  try {
    const pRef = doc(db, "productPrices", id);
    const pSnap = await getDoc(pRef);
    return pSnap.exists() ? { ...base, ...pSnap.data() } : base;
  } catch { return base; }
}

export async function setProductPriceStock(id, { price, stock }) {
  const ref = doc(db, "productPrices", id);
  return setDoc(ref, { price, stock, updatedAt: serverTimestamp() }, { merge: true });
}
export async function setProduct(id, data) {
  const ref = doc(db, "products", id);
  return setDoc(ref, data, { merge: true });
}

export async function createOrder({ userId, createdByUid, createdByRole, buyer, items }) {
  const batch = writeBatch(db);
  let total = 0; const pricedItems = [];

  for (const it of items) {
    const prodRef = doc(db, "products", it.id);
    const prodSnap = await getDoc(prodRef);
    if (!prodSnap.exists()) throw new Error(`Producto inexistente (${it.id})`);

    const priceRef = doc(db, "productPrices", it.id);
    const priceSnap = await getDoc(priceRef);
    const dataPrice = priceSnap.exists() ? priceSnap.data() : null;
    if (!dataPrice) throw new Error(`Sin precio para ${it.id}`);
    if ((dataPrice.stock ?? 0) < it.qty) throw new Error(`Sin stock para ${it.id}`);

    total += dataPrice.price * it.qty;
    pricedItems.push({ ...it, price: dataPrice.price });
    batch.update(priceRef, { stock: (dataPrice.stock ?? 0) - it.qty });
  }

  const orderDoc = {
    userId: userId || null, createdByUid, createdByRole,
    buyer: buyer || {}, items: pricedItems, total,
    status: "pedidos", createdAt: serverTimestamp()
  };
  const orderRef = await addDoc(ordersCol, orderDoc);
  await batch.commit();
  return orderRef.id;
}

export async function listOrdersForAdmin({ status } = {}) {
  let qRef = query(ordersCol, orderBy("createdAt", "desc"));
  if (status) qRef = query(ordersCol, where("status", "==", status), orderBy("createdAt", "desc"));
  const snap = await getDocs(qRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function listOrdersForSeller({ sellerUid, status } = {}) {
  let qRef = query(ordersCol, where("createdByUid", "==", sellerUid), orderBy("createdAt", "desc"));
  if (status) qRef = query(ordersCol, where("createdByUid", "==", sellerUid), where("status","==", status), orderBy("createdAt","desc"));
  const snap = await getDocs(qRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function listOrdersForCustomer({ userId } = {}) {
  let qRef = query(ordersCol, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(qRef);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function adminUpdateOrderStatus(orderId, nextStatus) {
  const allowed = ["pedidos", "preparado", "entregado"];
  if (!allowed.includes(nextStatus)) throw new Error("Estado inválido");
  await updateDoc(doc(db, "orders", orderId), { status: nextStatus, updatedAt: serverTimestamp() });
}
