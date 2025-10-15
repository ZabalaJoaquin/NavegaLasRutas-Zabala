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

export default function App() {
  return (
    <CartProvider>
        <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/producto/:id" element={<ProductDetail />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
            <Route path="/nosotros" element={<Nosotros />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<Login />} />
  <Route path="/admin" element={<ProtectedRoute role="admin"><Admin /></ProtectedRoute>} />
  <Route path="/clientes" element={<ProtectedRoute role="admin"><Clientes /></ProtectedRoute>} />
            </Routes>
        </main>
        <Footer />
        <WhatsappButton />
      </div>
            </AuthProvider>
      </CartProvider>
  )
}
