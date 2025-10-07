import { useMemo, useState, useEffect } from "react";
import NavBar from "./components/NavBar.jsx";
import { Routes, Route } from "react-router-dom";
import ItemListContainer from "./containers/ItemListContainer.jsx";
import ItemDetailContainer from "./containers/ItemDetailContainer.jsx";
import NotFound from "./components/NotFound.jsx";
import ProductsSection from "./components/ProductsSection.jsx";
import { PRODUCTS } from "./data/products.js";
import { getItems } from "./firebase.js";

/* ===== Reglas de IDs (tu criterio) ===== */
const MIN_ID = { aguas: 10000, champagne: 2000, vinos: 3000 };

/* ===== Helpers de normalización ===== */
const norm = (s = "") =>
  s
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const normalizeCategory = (c) => {
  const k = norm(String(c || ""));
  if (["vinos", "vino"].includes(k)) return "vinos";
  if (["champagne", "champagnes", "espumantes", "espumante"].includes(k)) return "champagne";
  if (["aguas", "agua", "saborizadas", "saborizada"].includes(k)) return "aguas";
  return null; // inválida
};

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const handleAddToCart = () => setCartCount((n) => n + 1);

  /* Cargamos todos los archivos por carpeta (una sola vez) */
  const imageMaps = useMemo(
    () => ({
      vinos: import.meta.glob("./assets/vinos/*", { eager: true }),
      champagne: import.meta.glob("./assets/champagne/*", { eager: true }),
      aguas: import.meta.glob("./assets/aguas/*", { eager: true }),
    }),
    []
  );

  /* Índices (nombre de archivo normalizado -> URL) por carpeta */
  const dicts = useMemo(() => {
    const build = (map) => {
      const out = {};
      for (const [path, mod] of Object.entries(map)) {
        const file = path.split("/").pop() || "";
        out[norm(file)] = mod.default;
      }
      return out;
    };
    return {
      vinos: build(imageMaps.vinos),
      champagne: build(imageMaps.champagne),
      aguas: build(imageMaps.aguas),
    };
  }, [imageMaps]);

  /* Busca URL dentro de una carpeta concreta */
  const findInCategory = (category, fileName) => {
    const d = dicts[category] || {};
    return d[norm(fileName)] ?? null;
  };

  /* Fallback: si la categoría es inválida o no está el archivo, busca en todas */
  const findAnywhere = (fileName) => {
    for (const cat of ["vinos", "champagne", "aguas"]) {
      const url = findInCategory(cat, fileName);
      if (url) return { url, cat };
    }
    return { url: null, cat: null };
  };

  /* Adaptamos productos a la UI con categoría normalizada y URL de imagen */
  const enriched = useMemo(() => {
    return PRODUCTS.map((p) => {
      const cat = normalizeCategory(p.category);
      let url = cat ? findInCategory(cat, p.image) : null;
      let resolvedCat = cat;

      if (!url) {
        const fb = findAnywhere(p.image);
        url = fb.url;
        if (!resolvedCat && fb.cat) resolvedCat = fb.cat; // si vino sin cat, usamos la detectada
      }

      return {
        id: p.id,
        category: resolvedCat, // puede quedar null si nada coincidió
        nombre: p.name,
        precio: p.price,
        img: url, // si es null, ProductCard mostrará placeholder
        _rawCategory: p.category, // para debug
        _imageName: p.image,
      };
    });
  }, [dicts]);

  /* Filtramos por categoría (evitamos undefined) */
  const vinos = useMemo(() => enriched.filter((p) => p.category === "vinos"), [enriched]);
  const champagnes = useMemo(() => enriched.filter((p) => p.category === "champagne"), [enriched]);
  const aguas = useMemo(() => enriched.filter((p) => p.category === "aguas"), [enriched]);

  /* ===== Validaciones en desarrollo ===== */
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    getItems();

    // Mostrar qué archivos detectó Vite en cada carpeta
    const keys = (m) => Object.keys(m).map((p) => p.split("/").pop());
    console.log("Detectados/vinos:", keys(imageMaps.vinos));
    console.log("Detectados/champagne:", keys(imageMaps.champagne));
    console.log("Detectados/aguas:", keys(imageMaps.aguas));

    // Categorías inválidas o vacías
    for (const p of enriched) {
      if (!p.category) {
        console.warn(
          `[CAT] "${p.nombre}" tiene categoría inválida ("${p._rawCategory}"). Usá exactamente: vinos / champagne / aguas`
        );
      }
    }

    // IDs fuera de rango
    for (const p of enriched) {
      const min = MIN_ID[p.category];
      if (typeof min === "number" && p.id < min) {
        console.warn(`[ID] ${p.nombre} (${p.category}) id=${p.id} debe ser >= ${min}`);
      }
    }

    // Imágenes no encontradas
    for (const p of enriched) {
      if (!p.img) {
        const catHint = p.category || p._rawCategory || "desconocida";
        console.warn(
          `[IMG] No se encontró "${p._imageName}" (cat: ${catHint}). Revisá nombre EXACTO y carpeta.\n` +
          `   Esperado en: src/assets/${p.category ?? "<vinos|champagne|aguas>"}/`
        );
      }
    }
  }, [enriched, imageMaps]);

  return (
    <>
      <NavBar cartCount={cartCount} />
      
      <main className="container">
        <Routes>
        <Route
          path="/"
          element={
            <>
              <section className="section">
                <h2 className="section-title">
                  ¡Bienvenido/a a DISTRIMAX! Venta y distribución de bebidas para negocios y mayoristas.
                </h2>
              </section>

              <ProductsSection
                id="productos"
                vinos={vinos}
                champagnes={champagnes}
                aguas={aguas}
                onAddToCart={handleAddToCart}
              />
            </>
          }
        />
          <Route path="/category/:categoryId" element={<ItemListContainer />} />
          <Route path="/item/:id" element={<ItemDetailContainer onAddToCart={handleAddToCart} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

    </>
  );
}
