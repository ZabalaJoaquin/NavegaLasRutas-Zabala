// API simple: Lee PRODUCTS y resuelve imágenes desde src/assets.
// Incluye 'desc' para el detalle y un buscador de imágenes con fallback.

import { PRODUCTS } from "../data/products.js";

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const imageMaps = {
  vinos: import.meta.glob("../assets/vinos/*", { eager: true }),
  champagne: import.meta.glob("../assets/champagne/*", { eager: true }),
  aguas: import.meta.glob("../assets/aguas/*", { eager: true }),
};

const base = (p) => (p.split("/").pop() || "");

// Sin acentos, minúsculas, espacios colapsados
const norm = (s = "") =>
  s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const ALLOWED = ["vinos", "champagne", "aguas"];

function tryIn(map, fileName) {
  const target = norm(fileName);
  for (const [path, mod] of Object.entries(map || {})) {
    if (norm(base(path)) === target) return mod.default;
  }
  return null;
}

function resolveImg(category, fileName) {
  const catOk = ALLOWED.includes(category) ? category : null;
  if (catOk) {
    const hit = tryIn(imageMaps[catOk], fileName);
    if (hit) return hit;
  }
  // 2) Fallback: busco en todas las carpetas
  for (const key of ALLOWED) {
    const hit = tryIn(imageMaps[key], fileName);
    if (hit) return hit;
  }
  return null;
}

export async function getCategories() {
  const cats = Array.from(
    new Set(
      (PRODUCTS || []).map((p) =>
        String(p?.category || "").toLowerCase().trim()
      )
    )
  )
    .filter((c) => c && ALLOWED.includes(c))
    .sort();
  return cats;
}

export async function getProducts(categoryId) {
  await delay(400);
  let list = PRODUCTS;
  if (categoryId) list = list.filter((p) => p.category === categoryId);
  return list.map((p) => ({
    id: p.id,
    category: p.category,
    nombre: p.name,
    precio: p.price,
    img: resolveImg(p.category, p.image),
    desc: p.description || `Producto de ${p.category}. ${p.name}.`,
  }));
}

export async function getProductById(id) {
  await delay(350);
  const found = (PRODUCTS || []).find((p) => String(p.id) === String(id));
  if (!found) return null;
  return {
    id: found.id,
    category: found.category,
    nombre: found.name,
    precio: found.price,
    img: resolveImg(found.category, found.image),
    desc: found.description || `Producto de ${found.category}. ${found.name}.`,
  };
}
