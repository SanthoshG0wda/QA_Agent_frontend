import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getDepartmentStats } from '../services/api'
import PageTransition from '../components/PageTransition'
import { CardSkeleton, TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import {
  ArrowLeft, Phone, Star, AlertTriangle, TrendingUp, Users,
  Building2, Calendar, ExternalLink, Clock
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass p-4 rounded-xl text-base shadow-glow">
        <p className="text-[#A1A1AA] mb-1">{label}</p>
        <p className="font-bold text-lg text-[#FAFAFA]">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

function formatDuration(sec) {
  if (!sec && sec !== 0) return '-'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function DepartmentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDepartmentStats(id)
      .then(setStats)
      .catch(() => navigate('/departments'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
          </div>
          <TableSkeleton rows={4} />
        </div>
      </PageTransition>
    )
  }

  if (!stats) return null

  const kpiCards = [
    { label: 'Total Calls', value: stats.total_calls, icon: Phone, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Avg Score', value: `${stats.avg_score}%`, icon: Star, color: 'bg-green-500/10 text-green-400' },
    { label: 'Agents', value: stats.total_agents, icon: Users, color: 'bg-purple-500/10 text-purple-400' },
    { label: 'Calls This Week', value: stats.calls_this_week, icon: TrendingUp, color: 'bg-yellow-500/10 text-yellow-400' },
  ]

  const scoreColor = (score) => score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <PageTransition>
      <div className="space-y-8">
        <button onClick={() => navigate('/')} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center text-accent-light font-bold text-3xl border border-accent/10">
              {stats.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#FAFAFA]">{stats.name}</h1>
              <p className="text-base text-[#A1A1AA] mt-1">Department Overview</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpiCards.map((card, i) => {
            const Icon = card.icon
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="card p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-[#A1A1AA] font-medium">{card.label}</p>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    <Icon size={24} />
                  </div>
                </div>
                <p className="text-4xl font-bold text-[#FAFAFA]">{card.value}</p>
              </motion.div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-[#FAFAFA] mb-5 flex items-center gap-2">
              <Users size={20} className="text-accent" /> Top Agents
            </h2>
            {stats.top_agents?.length === 0 ? (
              <p className="text-base text-[#52525B] py-8 text-center">No agents in this department</p>
            ) : (
              <div className="space-y-3">
                {stats.top_agents.map((agent, i) => (
                  <div key={agent.id}
                    onClick={() => navigate(`/agents/${agent.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl bg-surface-hover hover:bg-accent/5 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center text-sm font-bold text-accent-light">
                        {agent.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#FAFAFA]">{agent.name}</p>
                        <p className="text-xs text-[#52525B]">{agent.total_calls} calls</p>
                      </div>
                    </div>
                    <span className={`text-lg font-bold ${agent.avg_score >= 80 ? 'text-green-400' : agent.avg_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {agent.avg_score}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-[#FAFAFA] mb-5 flex items-center gap-2">
              <Star size={20} className="text-accent" /> Recent Evaluations
            </h2>
            {stats.recent_evaluations?.length === 0 ? (
              <p className="text-base text-[#52525B] py-8 text-center">No evaluations yet</p>
            ) : (
              <div className="space-y-2">
                {stats.recent_evaluations.map((ev, i) => (
                  <div key={ev.id}
                    onClick={() => navigate(`/results/${ev.id}`)}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-hover flex items-center justify-center text-sm font-medium text-[#A1A1AA]">
                        {ev.agent_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-sm text-[#D4D4D8]">{ev.agent_name || 'Unknown'}</p>
                        <p className="text-xs text-[#52525B]">
                          {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {ev.critical_error && (
                        <AlertTriangle size={14} className="text-red-400" />
                      )}
                      <span className={`text-lg font-bold ${ev.overall_score >= 80 ? 'text-green-400' : ev.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {ev.overall_score}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {stats.agents?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card overflow-hidden"
          >
            <div className="p-5 border-b border-surface-border">
              <h2 className="text-xl font-bold text-[#FAFAFA]">All Agents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-[#A1A1AA] text-left border-b border-surface-border">
                    <th className="p-4 font-medium">Agent</th>
                    <th className="p-4 font-medium">Calls</th>
                    <th className="p-4 font-medium">Evaluations</th>
                    <th className="p-4 font-medium">Avg Score</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {stats.agents.map((a, i) => (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-surface-border hover:bg-surface-hover transition-colors cursor-pointer"
                      onClick={() => navigate(`/agents/${a.id}`)}
                    >
                      <td className="p-4 font-medium text-[#D4D4D8]">{a.name}</td>
                      <td className="p-4 text-[#A1A1AA]">{a.total_calls}</td>
                      <td className="p-4 text-[#A1A1AA]">{a.evaluations}</td>
                      <td className="p-4">
                        <span className={`font-bold text-lg ${a.avg_score >= 80 ? 'text-green-400' : a.avg_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {a.avg_score}%
                        </span>
                      </td>
                      <td className="p-4">
                        <ExternalLink size={16} className="text-accent" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </PageTransition>
  )
}
