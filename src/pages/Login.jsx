import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Headphones, Loader2 } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const { loginUser } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const data = await login(email, password)
      loginUser(data.token, data.user)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="card p-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center mx-auto mb-5">
              <Headphones size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[#FAFAFA]">Welcome back</h1>
            <p className="text-base text-[#A1A1AA] mt-2">Sign in to CallAudit AI</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-base font-medium text-[#A1A1AA] mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-dark text-lg py-3.5" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-base font-medium text-[#A1A1AA] mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-dark text-lg py-3.5" placeholder="••••••••" required />
            </div>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-red-500/10 border border-red-500/20 text-red-400 text-base p-4 rounded-xl"
              >
                {error}
              </motion.div>
            )}
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              {loading ? <><Loader2 size={20} className="animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-base text-[#52525B] mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-accent-light hover:text-accent transition-colors font-medium">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
