import { Routes, Route } from 'react-router-dom'
import Navbar from "./components/Navbar.jsx"
import Footer from './components/Footer.jsx'
import Home from './routes/Home.jsx'
import Productos from './routes/Productos.jsx'
import Cart from './routes/Cart.jsx'
import Checkout from './routes/Checkout.jsx'
import Nosotros from './routes/Nosotros.jsx'
import Contacto from './routes/Contacto.jsx'
import CartProvider from './context/CartContext.jsx'
import { AuthProvider } from './auth/AuthContext.jsx'
import ProtectedRoute from './guards/ProtectedRoute.jsx'
import Login from './routes/Login.jsx'
import Admin from './routes/Admin.jsx'
import ProductDetail from './routes/ProductDetail.jsx'
import Clientes from './routes/Clientes.jsx'
import WhatsappButton from './components/WhatsappButton.jsx'
import NotFound from './routes/NotFound.jsx'

export default function App() {
  return (
    <CartProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 overflow-x-hidden">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* Catálogo */}
              <Route path="/productos" element={<Productos />} />
              <Route path="/categoria/:slug" element={<Productos />} />
              <Route path="/producto/:id" element={<ProductDetail />} />

              {/* Carrito / Checkout */}
              <Route path="/carrito" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />

              {/* Info */}
              <Route path="/nosotros" element={<Nosotros />} />
              <Route path="/contacto" element={<Contacto />} />

              {/* Auth */}
              <Route path="/login" element={<Login />} />

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute role="admin">
                    <Admin />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/clientes"
                element={
                  <ProtectedRoute role="admin">
                    <Clientes />
                  </ProtectedRoute>
                }
              />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
          <WhatsappButton />
        </div>
      </AuthProvider>
    </CartProvider>
  )
}
