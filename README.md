# Distrimax v2 · React + Vite

Versión personalizada con identidad visual, botón de WhatsApp, tira de Instagram y sección de marcas.

## ▶️ Uso
```bash
npm i
npm run dev
```

## Colores y tipografía
- Variables en `src/index.css` (`--brand`, `--brand-dark`, etc.).
- Fondo con burbujas en `src/assets/bg-distrimax.svg`.
- Fuente Google **Poppins**.

## WhatsApp
- Configurá `VITE_WHATSAPP_PHONE` en `.env.local` (ej: `5492625XXXXXX`).

## Firebase (opcional)
- Igual que v1: completá `.env.local` y usá colecciones `products` y `orders`.
- Sin Firebase, la app usa `src/data/products.json`.

## Páginas y componentes nuevos
- `Brands.jsx`: grilla de “marcas que trabajamos”.
- `InstagramStrip.jsx`: tira de enlaces a Instagram sin depender de API.
- `WhatsappButton.jsx`: botón fijo para chatear.
- Hero y fondos actualizados al estilo Distrimax.

---
## Roles y accesos
- Se integraron módulos de autenticación/roles del ZIP provisto (archivos copiados desde `src/auth|contexts|hooks|guards` si existían).
- Rutas agregadas automáticamente (si se detectaron): `/admin`, `/clientes`, `/login`.
- Si tu proyecto usa Firebase Auth, agregá las credenciales en `.env.local` y revisá los imports en los archivos copiados.

## Notas de merge
- `package.json` fusionado para incluir dependencias del ZIP y del branding v2.
- Se intentó detectar colores del ZIP original y aplicarlos a `src/index.css` (`--brand`, `--brand-dark`, `--brand-accent`).
- Logo: si el ZIP traía logo en `src/assets/` o `public/`, se copió a `src/assets/logo.*` y se ajustó el import en `Navbar.jsx`.


---
## Autenticación (Email/Password)
- Si configurás Firebase Auth (Email/Password) en tu proyecto + `.env.local`, el login usará Firebase.
- Sin Firebase Auth, funciona modo demo:
  - admin: `admin@distrimax / admin123`
  - cliente: `cliente@distrimax / cliente123`

## Admin CRUD
- Panel en `/admin` (sólo admin).
- **Clientes**: alta/listado/eliminación (col. `clients`).
- **Productos**: alta/listado/eliminación (col. `products`). La tienda lee de esta colección.
- **Pedidos**: listado en vivo desde `orders` (el checkout ya los graba).

## Reglas Firestore (desarrollo)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // SOLO PARA PRUEBAS LOCALES
    }
  }
}
```
