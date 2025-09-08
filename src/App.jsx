import { useState } from "react";
import NavBar from "./components/NavBar.jsx";
import ItemListContainer from "./components/ItemListContainer.jsx";
import ProductsSection from "./components/ProductsSection.jsx";

/** Helpers */
function prettyNameFromPath(path) {
  const file = path.split("/").pop() || "";
  const base = file.replace(/\.[a-z0-9]+$/i, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
function buildItemsFromGlob(globObj, precioFijo = null) {
  return Object.entries(globObj).map(([path, mod], idx) => ({
    id: `${path}-${idx}`,
    nombre: prettyNameFromPath(path),
    precio: typeof precioFijo === "number" ? precioFijo : null,
    img: mod.default,
  }));
}

/** Carga automática de imágenes (usa tu estructura) */
const vinosImgs = import.meta.glob("./assets/vinos/*.{png,jpg,jpeg,webp,avif}", { eager: true });
const champagneImgs = import.meta.glob("./assets/champagne/*.{png,jpg,jpeg,webp,avif}", { eager: true });

/** Precios por categoría */
const vinos = buildItemsFromGlob(vinosImgs, 3500);
const champagnes = buildItemsFromGlob(champagneImgs, 5000);

export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const handleAddToCart = () => setCartCount((n) => n + 1);

  return (
    <>
      <NavBar cartCount={cartCount} />
      <main className="container">
        <ItemListContainer greeting="¡Bienvenido/a a DISTRIMAX! Venta y distribución de bebidas para negocios y mayoristas." />
        <ProductsSection
          id="productos"
          vinos={vinos}
          champagnes={champagnes}
          onAddToCart={handleAddToCart}
        />
      </main>
    </>
  );
}
