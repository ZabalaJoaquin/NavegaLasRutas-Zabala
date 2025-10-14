import { useEffect, useMemo, useState } from "react";
import { isFirebaseEnabled, db, collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from "../utils/firebase.js";

export default function useCollection(name, { sortBy="createdAt", desc=true, fallback=[] } = {}){
  const [items, setItems] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let unsub = null;
    async function init(){
      setLoading(true);
      setError("");
      try {
        if (isFirebaseEnabled()) {
          const q = query(collection(db, name), orderBy(sortBy, desc ? "desc" : "asc"));
          unsub = onSnapshot(q, (snap) => {
            const arr = [];
            snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
            setItems(arr);
            setLoading(false);
          });
        } else {
          setItems(fallback);
          setLoading(false);
        }
      } catch (e) {
        setError(e?.message || String(e));
        setLoading(false);
      }
    }
    init();
    return () => unsub && unsub();
  }, [name, sortBy, desc]);

  async function create(data){
    if (isFirebaseEnabled()) {
      const col = collection(db, name);
      await addDoc(col, { ...data, createdAt: new Date() });
    } else {
      setItems(prev => [{ id: String(Date.now()), ...data }, ...prev]);
    }
  }

  async function update(id, data){
    if (isFirebaseEnabled()) {
      await updateDoc(doc(db, name, id), data);
    } else {
      setItems(prev => prev.map(it => it.id === id ? { ...it, ...data } : it));
    }
  }

  async function remove(id){
    if (isFirebaseEnabled()) {
      await deleteDoc(doc(db, name, id));
    } else {
      setItems(prev => prev.filter(it => it.id != id));
    }
  }

  return { items, loading, error, create, update, remove };
}
