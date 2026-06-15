import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { login } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Loader2 } from 'lucide-react'

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
    <div className="min-h-screen bg-surface flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-purple-600/5 pointer-events-none" />
      <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden lg:block space-y-8"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-extrabold text-xl tracking-tight shadow-lg shadow-accent/20">
              EP
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#FAFAFA] tracking-tight">EchoPeak</h1>
              <p className="text-sm text-[#A1A1AA] tracking-widest uppercase font-medium">Smarter Call Quality Intelligence</p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-bold text-[#FAFAFA] leading-tight">Analyze Every Conversation.<br />Improve Every Interaction.</h2>
            <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-md">AI-powered call evaluation, speaker intelligence, agent coaching, and conversation analytics in one unified platform.</p>
          </div>
          <div className="flex gap-4 pt-4">
            {['Deepgram', 'Groq', 'NVIDIA'].map(p => (
              <span key={p} className="text-xs text-[#52525B] font-medium px-3 py-1.5 rounded-full border border-surface-border">{p}</span>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="card p-10">
            <div className="text-center mb-10 lg:hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center mx-auto mb-4 text-white font-extrabold text-lg tracking-tight">
                EP
              </div>
              <h1 className="text-2xl font-bold text-[#FAFAFA]">EchoPeak</h1>
              <p className="text-sm text-[#A1A1AA] mt-1">Smarter Call Quality Intelligence</p>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-[#FAFAFA]">Welcome back</h2>
              <p className="text-base text-[#A1A1AA] mt-1">Sign in to your account</p>
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
    </div>
  )
}
