import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { listEvaluations, listDepartments } from '../services/api'
import { TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import { Star, ExternalLink, Calendar, Search, Clock } from 'lucide-react'

function formatDuration(sec) {
  if (!sec) return '-'
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Evaluations() {
  const navigate = useNavigate()
  const [evals, setEvals] = useState([])
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [minScore, setMinScore] = useState('')
  const [maxScore, setMaxScore] = useState('')

  useEffect(() => {
    Promise.all([listEvaluations(), listDepartments()])
      .then(([e, d]) => { setEvals(e); setDepts(d) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = evals.filter(e => {
    if (search && !e.agent_name?.toLowerCase().includes(search.toLowerCase()) && !e.department_name?.toLowerCase().includes(search.toLowerCase())) return false
    if (filterDept && e.department_id !== filterDept) return false
    if (filterStatus && e.status !== filterStatus) return false
    if (minScore && (e.overall_score ?? 0) < parseInt(minScore)) return false
    if (maxScore && (e.overall_score ?? 0) > parseInt(maxScore)) return false
    return true
  })

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Star size={28} className="text-accent" /> Evaluations
          </h1>
          <p className="text-base text-secondary mt-2">Browse and review QA evaluations</p>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input type="text" placeholder="Search agent or department..." value={search}
              onChange={(e) => setSearch(e.target.value)} className="input-dark pl-11 py-3 w-full" />
          </div>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}
            className="input-dark min-w-[160px] appearance-none cursor-pointer">
            <option value="">All Departments</option>
            {depts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="input-dark min-w-[140px] appearance-none cursor-pointer">
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <input type="number" placeholder="Min score" value={minScore}
            onChange={(e) => setMinScore(e.target.value)} className="input-dark w-24 py-3" min="0" max="100" />
          <input type="number" placeholder="Max score" value={maxScore}
            onChange={(e) => setMaxScore(e.target.value)} className="input-dark w-24 py-3" min="0" max="100" />
        </div>

        {loading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search || filterDept || filterStatus ? 'No matching evaluations' : 'No evaluations yet'}
            description={search || filterDept || filterStatus ? 'Try different filters' : 'Upload a call to generate your first EchoPeak analysis.'}
            actionLabel={search || filterDept || filterStatus ? undefined : 'Upload Call'}
            onAction={search || filterDept || filterStatus ? undefined : () => navigate('/upload')}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-secondary text-left border-b border-surface-border">
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium">Agent</th>
                    <th className="p-4 font-medium">Score</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Critical Errors</th>
                    <th className="p-4 font-medium">Duration</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ev, i) => {
                    const scoreColor = ev.overall_score >= 80 ? 'text-green-400' : ev.overall_score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    return (
                      <motion.tr
                        key={ev.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.03 * i }}
                        className="border-b border-surface-border hover:bg-surface-hover transition-colors cursor-pointer"
                        onClick={() => navigate(`/results/${ev.id}`)}
                      >
                        <td className="p-4 text-[#D4D4D8]">{ev.department_name || '-'}</td>
                        <td className="p-4 text-[#D4D4D8] font-medium">{ev.agent_name || '-'}</td>
                        <td className="p-4">
                          <span className={`text-lg font-bold ${scoreColor}`}>{ev.overall_score ?? '-'}</span>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            ev.status === 'completed' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {ev.status || 'unknown'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={ev.critical_error ? 'badge-red' : 'badge-green'}>
                            {ev.critical_error ? ev.critical_errors?.length || 'Yes' : 'None'}
                          </span>
                        </td>
                        <td className="p-4 text-secondary">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-muted" />
                            {formatDuration(ev.duration_seconds)}
                          </div>
                        </td>
                        <td className="p-4 text-secondary">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-muted" />
                            {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : '-'}
                          </div>
                        </td>
                        <td className="p-4">
                          <ExternalLink size={16} className="text-accent" />
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
