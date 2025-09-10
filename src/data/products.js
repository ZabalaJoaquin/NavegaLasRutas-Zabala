// Catálogo Distrimax (SSOT)
// IDs por rango: aguas 10000+, champagnes 2000+, vinos 3000+
// Las imágenes deben existir con ese nombre EXACTO en:
//   src/assets/aguas/       |  src/assets/champagne/  |  src/assets/vinos/

export const CATEGORIES = {
  AGUAS: "aguas",
  CHAMPAGNE: "champagne",
  VINOS: "vinos",
};

export const CATALOG = {
  // ============ AGUAS / SABORIZADAS (10000+) ============
  [CATEGORIES.AGUAS]: [
    {
      id: 10001,
      name: "Vida Manzana (sin azúcar) 1.5 L",
      price: 1800,
      image: "Agua Vida Manzana Sin Azucar.jpg",
    },
    {
      id: 10002,
      name: "Vida Manzana 1.5 L",
      price: 1800,
      image: "Agua Vida Manzana.jpg",
    },
    {
      id: 10003,
      name: "Vida Naranja 1.5 L",
      price: 1800,
      image: "Agua Vida Naranja.jpg",
    },
    {
      id: 10004,
      name: "Vida Pomelo 1.5 L",
      price: 1800,
      image: "Agua Vida Pomelo.jpg",
    },
  ],

  // ================== CHAMPAGNES (2000+) =================
  [CATEGORIES.CHAMPAGNE]: [
    {
      id: 2001,
      name: "Domaine Extra Brut",
      price: 5000,
      image: "Domaine Extra Brut.jpg",
    },
    {
      id: 2002,
      name: "Mumm Brut Rosé",
      price: 5000,
      image: "Mumm Brut Rosé.jpg",
    },
    {
      id: 2003,
      name: "Mumm Demi Sec",
      price: 5000,
      image: "Mumm Demi Sec.jpg",
    },
    {
      id: 2004,
      name: "Mumm Extra Brut",
      price: 5000,
      image: "Mumm Extra Brut.jpg",
    },
  ],

  // ===================== VINOS (3000+) ===================
  [CATEGORIES.VINOS]: [
    {
      id: 3001,
      name: "Cafayate Malbec Roble 750 ml",
      price: 3500,
      image: "Cafayate Malbec.jpg",
    },
    {
      id: 3002,
      name: "Cafayate Rosé 750 ml",
      price: 3500,
      image: "Cafayate Rosé.jpg",
    },
    {
      id: 3003,
      name: "Cafayate Syrah 750 ml",
      price: 3500,
      image: "Cafayate Syrah.jpg",
    },
    {
      id: 3004,
      name: "Cafayate Torrontés Dulce 750 ml",
      price: 3500,
      image: "Cafayate Torrontes.jpg",
    },
  ],
};

// Compatibilidad: array plano (si tu App.jsx ya esperaba PRODUCTS)
export const PRODUCTS = [
  ...CATALOG[CATEGORIES.AGUAS],
  ...CATALOG[CATEGORIES.CHAMPAGNE],
  ...CATALOG[CATEGORIES.VINOS],
];
