import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.jsx'

const ADMIN_EMAILS = ['distrimax.alvear@gmail.com']

export default function ProtectedRoute({ role, children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />

  const isAdminByEmail = ADMIN_EMAILS.includes(user.email ?? '')

  if (role === 'admin') {
    if (user.role === 'admin' || isAdminByEmail) return children
    return <Navigate to="/" replace />
  }
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}
