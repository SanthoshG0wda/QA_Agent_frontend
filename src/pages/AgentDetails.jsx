import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAgent, getAgentEvaluations } from '../services/api'
import PageTransition from '../components/PageTransition'
import { CardSkeleton, TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import {
  ArrowLeft, Phone, Star, AlertTriangle, Upload, ExternalLink,
  User, Mail, Building2, Calendar, TrendingUp
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="glass p-4 rounded-xl text-base shadow-glow">
        <p className="text-secondary mb-1">{label}</p>
        <p className="font-bold text-lg text-primary">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export default function AgentDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [evaluations, setEvaluations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const [agentData, evalData] = await Promise.all([
          getAgent(id),
          getAgentEvaluations(id),
        ])
        setAgent(agentData)
        setEvaluations(evalData)
      } catch {
        navigate('/agents')
      } finally {
        setLoading(false)
      }
    })()
  }, [id, navigate])

  if (loading) {
    return (
      <PageTransition>
        <div className="space-y-8">
          <CardSkeleton />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[1,2,3].map(i => <CardSkeleton key={i} />)}
          </div>
          <TableSkeleton rows={4} />
        </div>
      </PageTransition>
    )
  }

  if (!agent) return null

  const stats = [
    { label: 'Total Calls', value: agent.total_calls, icon: Phone, color: 'bg-blue-500/10 text-blue-400' },
    { label: 'Average Score', value: `${agent.average_score}%`, icon: Star, color: 'bg-green-500/10 text-green-400' },
    { label: 'Critical Errors', value: agent.critical_errors ?? 0, icon: AlertTriangle, color: 'bg-red-500/10 text-red-400' },
  ]

  return (
    <PageTransition>
      <div className="space-y-8">
        <button onClick={() => navigate('/agents')} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Agents
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center text-accent-light font-bold text-3xl border border-accent/10">
                {agent.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary">{agent.name}</h1>
                <div className="flex items-center gap-4 mt-2 text-sm text-secondary">
                  <span className="flex items-center gap-1.5"><Mail size={16} /> {agent.email}</span>
                  <span className="flex items-center gap-1.5"><Building2 size={16} /> {agent.department_name || agent.department || 'General'}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/agents/${id}/upload`)}
              className="btn-primary flex items-center gap-2"
            >
              <Upload size={20} /> Upload New Call
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {stats.map((stat, i) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
                className="card p-6"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <Icon size={24} />
                  </div>
                  <p className="text-base text-secondary">{stat.label}</p>
                </div>
                <p className="text-3xl font-bold text-primary">{stat.value}</p>
              </motion.div>
            )
          })}
        </div>

        {evaluations.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-primary mb-5 flex items-center gap-2">
              <TrendingUp size={20} className="text-accent" /> Performance Trend
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={[...evaluations].reverse().map((e, i) => ({
                name: `#${i + 1}`,
                score: e.overall_score || 0,
              }))}>
                <XAxis dataKey="name" stroke="#52525B" fontSize={13} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#52525B" fontSize={13} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#3B82F6" strokeWidth={2.5}
                  dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 7, fill: '#3B82F6' }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        <div className="card">
          <div className="p-5 border-b border-surface-border">
            <h2 className="text-xl font-bold text-primary">Evaluation History</h2>
          </div>
          {evaluations.length === 0 ? (
            <EmptyState
              title="No evaluations yet"
              description="Upload a call for this agent to start tracking performance."
              actionLabel="Upload Call"
              onAction={() => navigate(`/agents/${id}/upload`)}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-secondary text-left border-b border-surface-border">
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">File</th>
                    <th className="p-4 font-medium">Score</th>
                    <th className="p-4 font-medium">Critical</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {evaluations.map((ev, i) => (
                    <motion.tr
                      key={ev.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-surface-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="p-4 text-[#D4D4D8]">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted" />
                          {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : '-'}
                        </div>
                      </td>
                      <td className="p-4 text-[#D4D4D8] max-w-[250px] truncate">{ev.filename || '-'}</td>
                      <td className="p-4">
                        <span className={`font-bold text-lg ${
                          ev.overall_score >= 80 ? 'text-green-400' :
                          ev.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                        }`}>
                          {ev.overall_score}%
                        </span>
                      </td>
                      <td className="p-4">
                        {ev.critical_error ? (
                          <span className="badge-red">Yes</span>
                        ) : (
                          <span className="badge-green">No</span>
                        )}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/results/${ev.id}`)}
                          className="btn-ghost text-accent-light hover:text-accent flex items-center gap-1.5"
                        >
                          View <ExternalLink size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
