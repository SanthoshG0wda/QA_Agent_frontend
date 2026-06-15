import { motion } from 'framer-motion'
import { CheckCircle, ArrowUpCircle, AlertTriangle } from 'lucide-react'

const categories = [
  { label: 'Opening', key: 'opening_score', max: 10 },
  { label: 'Communication', key: 'communication_score', max: 15 },
  { label: 'Listening', key: 'listening_score', max: 15 },
  { label: 'Knowledge', key: 'knowledge_score', max: 15 },
  { label: 'Discovery', key: 'discovery_score', max: 10 },
  { label: 'Call Control', key: 'call_control_score', max: 10 },
  { label: 'Professionalism', key: 'professionalism_score', max: 10 },
  { label: 'Compliance', key: 'compliance_score', max: 5 },
  { label: 'Closing', key: 'closing_score', max: 5 },
]

function RadialScore({ score }) {
  const r = 72
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 80 ? '#22C55E' : score >= 60 ? '#F59E0B' : '#EF4444'

  return (
    <div className="relative w-48 h-48 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#27272A" strokeWidth="10" />
        <motion.circle
          cx="80" cy="80" r={r}
          fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-bold text-[#FAFAFA]">{score}</span>
        <span className="text-lg text-[#A1A1AA]">/ 100</span>
      </div>
    </div>
  )
}

export default function ScoreCard({ evaluation }) {
  const pct = evaluation.overall_score

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="card p-10 text-center">
        <p className="text-base text-[#A1A1AA] uppercase tracking-widest mb-5">Overall Score</p>
        <RadialScore score={pct} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(({ label, key, max }, idx) => {
          const val = evaluation[key] || 0
          const p = (val / max) * 100
          const barColor = p >= 80 ? 'bg-green-500' : p >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * idx }}
              className="card p-5"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-base text-[#A1A1AA]">{label}</span>
                <span className="text-base font-semibold text-[#FAFAFA]">{val}/{max}</span>
              </div>
              <div className="w-full bg-[#1f1f23] rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p}%` }}
                  transition={{ duration: 1, delay: 0.1 * idx, ease: 'easeOut' }}
                  className={`h-3 rounded-full ${barColor}`}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="card p-6 border-green-500/10">
          <h3 className="font-semibold text-green-400 mb-4 flex items-center gap-2 text-lg">
            <CheckCircle size={20} /> Strengths
          </h3>
          {evaluation.strengths?.length ? (
            <ul className="space-y-3">
              {evaluation.strengths.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-2.5 text-base text-[#D4D4D8]"
                >
                  <CheckCircle size={18} className="text-green-500 mt-0.5 shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-[#52525B]">None identified</p>
          )}
        </div>

        <div className="card p-6 border-yellow-500/10">
          <h3 className="font-semibold text-yellow-400 mb-4 flex items-center gap-2 text-lg">
            <ArrowUpCircle size={20} /> Improvements
          </h3>
          {evaluation.improvements?.length ? (
            <ul className="space-y-3">
              {evaluation.improvements.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="flex items-start gap-2.5 text-base text-[#D4D4D8]"
                >
                  <ArrowUpCircle size={18} className="text-yellow-500 mt-0.5 shrink-0" />
                  {s}
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-base text-[#52525B]">None identified</p>
          )}
        </div>
      </div>

      <div className={`card p-6 ${evaluation.critical_error ? 'border-red-500/20' : 'border-green-500/10'}`}>
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg text-[#FAFAFA]">
          <AlertTriangle size={20} className={evaluation.critical_error ? 'text-red-400' : 'text-green-400'} />
          Critical Errors
        </h3>
        {evaluation.critical_error ? (
          <ul className="space-y-3">
            {evaluation.critical_errors?.map((err, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                className="flex items-start gap-2.5 text-base text-red-400"
              >
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                {err}
              </motion.li>
            ))}
          </ul>
        ) : (
          <p className="text-base text-green-400 flex items-center gap-2">
            <CheckCircle size={18} /> No critical errors detected
          </p>
        )}
      </div>
    </motion.div>
  )
}
