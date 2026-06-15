import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Phone, Star, ArrowRight } from 'lucide-react'

export default function AgentCard({ agent, index = 0 }) {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={() => navigate(`/agents/${agent.id}`)}
      className="card p-6 card-hover cursor-pointer group"
    >
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center text-accent-light font-bold text-xl border border-accent/10">
          {agent.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-[#FAFAFA] truncate group-hover:text-accent-light transition-colors">
            {agent.name}
          </h3>
          <p className="text-sm text-[#52525B] truncate">{agent.email}</p>
        </div>
        {agent.average_score > 0 && (
          <div className={`text-lg font-bold px-4 py-1.5 rounded-xl ${
            agent.average_score >= 80 ? 'bg-green-500/10 text-green-400' :
            agent.average_score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>
            {agent.average_score}%
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm px-3 py-1 rounded-full bg-accent/10 text-accent-light border border-accent/10">
          {agent.department || 'General'}
        </span>
      </div>
      <div className="flex items-center gap-6 text-base pt-4 border-t border-surface-border">
        <div className="flex items-center gap-2">
          <Phone size={18} className="text-[#52525B]" />
          <span className="text-[#A1A1AA]">{agent.total_calls} calls</span>
        </div>
        {agent.average_score > 0 && (
          <div className="flex items-center gap-2">
            <Star size={18} className="text-[#52525B]" />
            <span className="text-[#A1A1AA]">{agent.average_score}% avg</span>
          </div>
        )}
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity">
        View Details <ArrowRight size={14} />
      </div>
    </motion.div>
  )
}
