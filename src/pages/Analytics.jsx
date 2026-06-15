import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAnalyticsSummary, getAnalyticsTrends, getAnalyticsCategories } from '../services/api'
import PageTransition from '../components/PageTransition'
import { CardSkeleton } from '../components/Skeleton'
import {
  BarChart3, TrendingUp, AlertTriangle, Target
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

export default function Analytics() {
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getAnalyticsTrends(),
      getAnalyticsCategories(),
    ]).then(([s, t, c]) => {
      setSummary(s)
      setTrends(t)
      setCategories(c)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const catNames = {
    opening: 'Opening', communication: 'Communication', listening: 'Listening',
    knowledge: 'Knowledge', discovery: 'Discovery', call_control: 'Call Control',
    professionalism: 'Professionalism', compliance: 'Compliance', closing: 'Closing',
  }

  const catData = Object.entries(categories).map(([k, v]) => ({
    name: catNames[k] || k,
    value: v,
    color: v >= 80 ? '#22C55E' : v >= 60 ? '#F59E0B' : '#EF4444',
  }))

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
            <BarChart3 size={28} className="text-accent" /> Analytics
          </h1>
          <p className="text-base text-[#A1A1AA] mt-2">Performance metrics and trends</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1,2,3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-8"
            >
              <h2 className="text-xl font-semibold text-[#FAFAFA] mb-6 flex items-center gap-2">
                <TrendingUp size={22} className="text-accent" /> Score Trend
              </h2>
              {trends.length === 0 ? (
                <p className="text-base text-[#52525B] py-12 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={trends}>
                    <XAxis dataKey="month" stroke="#52525B" fontSize={13} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#52525B" fontSize={13} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="avg" stroke="#3B82F6" strokeWidth={2.5}
                      dot={{ fill: '#3B82F6', r: 4 }} activeDot={{ r: 7, fill: '#3B82F6' }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-8"
            >
              <h2 className="text-xl font-semibold text-[#FAFAFA] mb-6 flex items-center gap-2">
                <Target size={22} className="text-accent" /> Category Performance
              </h2>
              {catData.length === 0 ? (
                <p className="text-base text-[#52525B] py-12 text-center">No data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={catData} layout="vertical" margin={{ left: 110 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#52525B" fontSize={13} tickLine={false} axisLine={false} />
                    <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={22}>
                      {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-8"
            >
              <h2 className="text-xl font-semibold text-[#FAFAFA] mb-6 flex items-center gap-2">
                <AlertTriangle size={22} className="text-red-400" /> Critical Errors
              </h2>
              <p className="text-6xl font-bold text-red-400">{summary?.critical_errors ?? 0}</p>
              <p className="text-base text-[#A1A1AA] mt-3">total critical errors detected across all evaluations</p>
              <div className="mt-8 p-5 rounded-2xl bg-red-500/5 border border-red-500/10">
                <p className="text-sm text-[#A1A1AA]">
                  Critical errors represent compliance breaches, policy violations, or severe customer service failures detected by AI analysis.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="card p-8"
            >
              <h2 className="text-xl font-semibold text-[#FAFAFA] mb-6">Quick Stats</h2>
              <div className="space-y-4">
                {[
                  ['Total Evaluations', summary?.total_calls ?? 0, '#FAFAFA'],
                  ['Average Score', `${summary?.avg_score ?? 0}%`, '#22C55E'],
                  ['Calls This Week', summary?.calls_this_week ?? 0, '#FAFAFA'],
                  ['Error Rate', summary?.total_calls ? `${((summary.critical_errors / summary.total_calls) * 100).toFixed(1)}%` : '0%', '#EF4444'],
                ].map(([label, value, color]) => (
                  <div key={label} className="flex justify-between items-center p-4 rounded-xl bg-surface-hover">
                    <span className="text-base text-[#A1A1AA]">{label}</span>
                    <span className="text-lg font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
