import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { listEvaluations } from '../services/api'
import { Star } from 'lucide-react'

export default function EvaluationList() {
  const navigate = useNavigate()
  const [evaluations, setEvaluations] = useState([])

  useEffect(() => {
    listEvaluations().then((data) => {
      if (Array.isArray(data)) setEvaluations(data.slice(0, 5))
    }).catch(() => {})
  }, [])

  if (!Array.isArray(evaluations) || !evaluations.length) return null

  return (
    <div className="card p-6">
      <h2 className="text-xl font-bold text-[#FAFAFA] mb-5 flex items-center gap-2">
        <Star size={22} className="text-accent" /> Recent Evaluations
      </h2>
      <div className="space-y-3">
        {evaluations.map((ev, i) => (
          <motion.div
            key={ev.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.03 * i }}
            onClick={() => navigate(`/results/${ev.id}`)}
            className="flex justify-between items-center p-4 rounded-xl card-hover cursor-pointer border border-surface-border"
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                ev.overall_score >= 80 ? 'bg-green-500/10 text-green-400' :
                ev.overall_score >= 60 ? 'bg-yellow-500/10 text-yellow-400' :
                'bg-red-500/10 text-red-400'
              }`}>
                {ev.overall_score}
              </div>
              <div>
                <p className="text-base font-semibold text-[#FAFAFA]">Score: {ev.overall_score}/100</p>
                <p className="text-sm text-[#52525B]">{new Date(ev.created_at).toLocaleString()}</p>
              </div>
            </div>
            <span className={`text-sm ${ev.critical_error ? 'badge-red' : 'badge-green'}`}>
              {ev.critical_error ? 'Errors' : 'Clean'}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
