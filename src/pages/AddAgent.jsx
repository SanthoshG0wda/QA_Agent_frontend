import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { createAgent } from '../services/api'
import PageTransition from '../components/PageTransition'
import { UserPlus, Loader2, ArrowLeft } from 'lucide-react'

export default function AddAgent() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) {
      setError('Name and email are required')
      return
    }
    setLoading(true)
    setError('')
    try {
      await createAgent(name.trim(), email.trim(), department.trim())
      navigate('/agents')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create agent')
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-8">
        <button onClick={() => navigate('/agents')} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Agents
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <UserPlus size={28} className="text-accent-light" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#FAFAFA]">Add Agent</h1>
              <p className="text-base text-[#A1A1AA]">Create a new agent profile</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-base p-4 rounded-xl">
                {error}
              </div>
            )}
            <div>
              <label className="block text-base font-medium text-[#A1A1AA] mb-2">Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="input-dark" placeholder="Agent name" />
            </div>
            <div>
              <label className="block text-base font-medium text-[#A1A1AA] mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-dark" placeholder="agent@example.com" />
            </div>
            <div>
              <label className="block text-base font-medium text-[#A1A1AA] mb-2">Department</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)}
                className="input-dark" placeholder="Sales, Support, etc." />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              {loading ? <><Loader2 size={20} className="animate-spin" /> Creating...</> : 'Create Agent'}
            </button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  )
}
