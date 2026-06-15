import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { listEvaluations } from '../services/api'
import { CardSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import PageTransition from '../components/PageTransition'
import { Star, Search, ExternalLink, Calendar, CheckCircle, AlertTriangle } from 'lucide-react'

export default function Evaluations() {
  const navigate = useNavigate()
  const [evals, setEvals] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    listEvaluations().then(setEvals).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const filtered = evals.filter((e) =>
    !search || e.id.includes(search) || (e.transcript || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
              <Star size={28} className="text-accent" /> Evaluations
            </h1>
            <p className="text-base text-[#A1A1AA] mt-2">Browse and review QA evaluations</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525B]" />
            <input
              type="text" placeholder="Search evaluations..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              className="input-dark pl-11 py-3.5"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={search ? 'No matching evaluations' : 'No evaluations yet'}
            description={search ? 'Try a different search term' : 'Upload a call to generate the first evaluation.'}
            actionLabel={search ? undefined : 'Upload Call'}
            onAction={search ? undefined : () => navigate('/upload')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((ev, i) => {
              const scoreColor = ev.overall_score >= 80 ? 'text-green-400 bg-green-500/10 border-green-500/20' :
                ev.overall_score >= 60 ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' :
                'text-red-400 bg-red-500/10 border-red-500/20'
              return (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * i }}
                  onClick={() => navigate(`/results/${ev.id}`)}
                  className="card p-6 card-hover cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-4 py-1.5 rounded-xl border text-2xl font-bold ${scoreColor}`}>
                      {ev.overall_score}
                    </div>
                    <span className={ev.critical_error ? 'badge-red' : 'badge-green'}>
                      {ev.critical_error ? 'Errors' : 'Clean'}
                    </span>
                  </div>
                  <div className="space-y-2 mb-4">
                    {ev.strengths?.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-green-400">
                        <CheckCircle size={16} className="mt-0.5 shrink-0" />
                        <span className="truncate">{s}</span>
                      </div>
                    ))}
                    {ev.improvements?.slice(0, 2).map((s, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-yellow-400">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span className="truncate">{s}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-surface-border">
                    <div className="flex items-center gap-2 text-sm text-[#52525B]">
                      <Calendar size={14} />
                      {ev.created_at ? new Date(ev.created_at).toLocaleDateString() : '-'}
                    </div>
                    <ExternalLink size={16} className="text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
