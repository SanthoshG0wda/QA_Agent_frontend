import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 size={32} className="text-accent animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}
