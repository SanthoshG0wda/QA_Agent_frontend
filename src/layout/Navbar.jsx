import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b sticky top-0 z-30">
      <div className="flex items-center justify-end gap-4 px-6 py-3">
        <span className="text-sm text-gray-600">
          {user?.name} <span className="text-xs text-gray-400 capitalize">({user?.role})</span>
        </span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-500 hover:text-red-700"
        >
          Logout
        </button>
      </div>
    </header>
  )
}
