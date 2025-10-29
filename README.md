<div align="center">

<h1>🥂 DISTRIMAX</h1>
<p><em>Distribuidora de bebidas — General Alvear, Mendoza 🇦🇷</em></p>

<img src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg" width="70" alt="React logo" />
<img src="https://firebase.google.com/static/images/brand-guidelines/logo-logomark.png" width="64" alt="Firebase logo" />

<p><strong>Proyecto Final — Curso React JS (Coderhouse)</strong><br/>Comisión 88015</p>

<p>🚀 <a href="https://navega-las-rutas-zabala.vercel.app/">Deploy</a> • 📦 <a href="https://github.com/ZabalaJoaquin/NavegaLasRutas-Zabala">Repositorio</a></p>
</div>

# Proyecto Final — E-commerce con React (Distrimax)

> Es una Single Page Application (SPA) de e-commerce pensada para la entrega final del curso. Permite navegar el catálogo, ver detalle, armar carrito y completar el checkout con persistencia en **Firebase/Firestore**.

---

## Datos de la entrega
**Estudiante:** Joaquin Zabala  
**Comisión:** 88015  
**Repositorio:** https://github.com/ZabalaJoaquin/NavegaLasRutas-Zabala  
**Deploy:** https://navega-las-rutas-zabala.vercel.app/

---

## ¿Qué hace?
- Catálogo por categorías y detalle por producto (rutas dinámicas).
- **ItemCount** con validaciones (mínimo 1, tope por stock) y se **oculta** después de agregar.
- **Carrito** con Context (añadir, eliminar, vaciar, cambiar cantidades, **subtotal/total**).
- **CartWidget** muestra unidades totales siempre.
- **Checkout** con validaciones: crea **orden** en Firestore y muestra el **ID** generado.
- **Persistencia** del carrito en `localStorage` (UX).
- **Panel de administración** (demo): edición de productos y gestión de pedidos por estado (*Pendiente / En proceso / Entregado*).
- **Contacto por WhatsApp** desde la UI.
- UX con loaders y estados vacíos ("sin stock", "carrito vacío", etc.).

---

## Stack
- **React + Vite**
- **React Router v6** (SPA sin recargas)
- **Context API** (estado global del carrito)
- **Firebase**: Firestore + Authentication (email/password)
- **Storage**: Firebase Storage
- **Estilos**: Tailwind CSS

---

## Estructura de componentes (resumen)
```
App
└─ NavBar
   └─ CartWidget
└─ ItemListContainer → ItemList → Item (ProductCard)
└─ ItemDetailContainer → ItemDetail → ItemCount
└─ Cart → CartItem
└─ CheckoutForm
└─ Admin (panel)
└─ Components extra: WhatsappButton, Brands
└─ Context: CartContext, AuthContext
```
> Contenedores manejan datos/efectos; presentacionales renderizan UI.

---


## Cómo funciona (paso a paso breve)
1. Inicio/Catálogo (`/` y `/categoria/:id`).
2. Detalle (`/item/:id`) con **ItemCount**.
3. Al agregar, el contador se **oculta** y puedo ir al **carrito**.
4. En `/cart` gestiono items y veo totales.
5. En `/checkout` completo datos, se crea la **orden** en Firestore y se muestra su **ID**.

**Rutas claves**: `/`, `/categoria/:id`, `/item/:id`, `/cart`, `/checkout`.

---

## Instalación rápida
```bash
# 1) Clonar
git clone https://github.com/ZabalaJoaquin/NavegaLasRutas-Zabala.git
cd NavegaLasRutas-Zabala

# 2) Instalar
npm install

# 3) Variables de entorno (crear .env.local)
```
`.env.local`:

```bash
# 4) Ejecutar en dev
npm run dev
```

---

## Firebase
**Colecciones**: `products`, `orders`, `users`.
- **products**: título, precio, stock, categoría, imagen, etc.
- **orders**: buyer {name, email, phone}, items [{id, title, price, quantity}], total, date, status.
- **users**: { email, displayName, role: 'admin' | 'user' }.

**Reglas**
- `products`: lectura pública; escritura sólo admin.
- `orders`: cualquiera crea; cada usuario lee sus órdenes; admin ve todas.
- `users`: admin gestiona roles.

---

## Acceso y roles

**Administrador**
- **Email**: `distrimax.alvear@gmail.com`
- **Contraseña**: `admin123`
- **Cómo ingresar**: 1) Clic en **Ingresar** → 2) Completar credenciales → 3) Entrar al **Panel de administrador** para gestionar productos y pedidos.

**Usuario**
- **Email**: `prueba@gmail.com`
- **Contraseña**: `prueba123`
- **Qué puede hacer**: ver precios, agregar productos al carrito y realizar una **pre-compra**. **No** tiene acceso al panel admin.

*Nota*: Los roles se resuelven leyendo `users/{uid}` en Firestore tras el login.

---

## Cómo testear rápido (1 minuto)
**Admin**
1) Ir a **Ingresar** → usuario `distrimax.alvear@gmail.com` / `admin123`.
2) Ver **CartWidget** con contador en la NavBar.
3) Entrar a **Panel de administrador** y editar un producto (precio/stock) → guardar.
4) Volver al catálogo y verificar el cambio.

**Usuario**
1) Ir a **Ingresar** → `prueba@gmail.com` / `prueba123`.
2) Entrar a un **detalle**, elegir cantidad con **ItemCount** (se oculta al agregar).
3) Revisar **Carrito** (subtotal/total). 
4) **Checkout** → ver **ID de orden** generado en Firestore.

---

## Deploy
Deploy en **Vercel**: https://navega-las-rutas-zabala.vercel.app/  
Variables `VITE_*` definidas.

---

## Autor
**Estudiante**: Joaquin Zabala
**Curso/Comisión**: 88015
**Proyecto**: Distrimax — E-commerce SPA (2025)

> Gracias por la corrección 🙌 Si necesita un usuario extra o acceso a capturas, lo agrego al README.

