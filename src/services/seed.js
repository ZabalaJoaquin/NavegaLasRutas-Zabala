import { db } from "../firebase/config";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";

const ITEMS = [
  { id: "vino-malbec-750",       title: "Vino Malbec 750 ml",       description: "Vino tinto Malbec joven", category: "vinos",      imageUrl: "https://placehold.co/600x600?text=Vino+Malbec",      price: 6500,  stock: 40 },
  { id: "vino-cabernet-750",     title: "Vino Cabernet 750 ml",     description: "Vino tinto Cabernet Sauvignon", category: "vinos", imageUrl: "https://placehold.co/600x600?text=Vino+Cabernet",    price: 6200,  stock: 35 },
  { id: "vino-rosado-750",       title: "Vino Rosado 750 ml",       description: "Vino rosado fresco", category: "vinos",            imageUrl: "https://placehold.co/600x600?text=Vino+Rosado",      price: 5900,  stock: 25 },
  { id: "champagne-extra-brut-750", title: "Champagne Extra Brut 750 ml", description: "Champagne Extra Brut", category: "champagne", imageUrl: "https://placehold.co/600x600?text=Champagne+Extra+Brut", price: 14900, stock: 20 },
  { id: "espumante-demi-sec-750",   title: "Espumante Demi Sec 750 ml",   description: "Espumante Demi Sec", category: "champagne",  imageUrl: "https://placehold.co/600x600?text=Espumante+Demi+Sec", price: 9900,  stock: 30 },
  { id: "fernet-1l",             title: "Fernet 1L",               description: "Aperitivo amargo", category: "fernet",              imageUrl: "https://placehold.co/600x600?text=Fernet+1L",        price: 8600,  stock: 50 },
  { id: "cerveza-rubia-lata-473", title: "Cerveza Rubia Lata 473 ml", description: "Cerveza estilo lager", category: "cervezas",     imageUrl: "https://placehold.co/600x600?text=Cerveza+473ml",    price: 1800,  stock: 120 },
  { id: "cerveza-negra-ipa-500",  title: "Cerveza Negra IPA 500 ml", description: "Cerveza estilo IPA", category: "cervezas",        imageUrl: "https://placehold.co/600x600?text=IPA+500ml",        price: 2200,  stock: 70 },
];

export async function seedDistrimax() {
  const batch = writeBatch(db);
  const now = serverTimestamp();
  for (const p of ITEMS) {
    const { id, title, description, category, imageUrl, price, stock } = p;
    batch.set(doc(db, "products", id), { title, description, category, imageUrl });
    batch.set(doc(db, "productPrices", id), { price, stock, updatedAt: now });
  }
  await batch.commit();
  return ITEMS.length;
}
