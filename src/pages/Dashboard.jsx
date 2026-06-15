import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  getAnalyticsSummary, getAnalyticsTrends, getAnalyticsCategories
} from '../services/api'
import { useAuth } from '../context/AuthContext'
import { CardSkeleton } from '../components/Skeleton'
import PageTransition from '../components/PageTransition'
import {
  Users, Phone, Star, AlertTriangle,
  TrendingUp, ArrowUp, ArrowDown
} from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts'

function Greeting() {
  const { user } = useAuth()
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 30000)
    return () => clearInterval(t)
  }, [])
  const hour = time.getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  return (
    <div>
      <h1 className="text-3xl font-bold text-[#FAFAFA]">{greet}, {user?.name || 'User'} 👋</h1>
      <p className="text-base text-[#A1A1AA] mt-2">
        {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>
    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, trend, trendLabel, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="card p-6 card-hover"
    >
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-[#A1A1AA] font-medium">{label}</p>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={24} />
        </div>
      </div>
      <p className="text-4xl font-bold text-[#FAFAFA]">{value}</p>
      {trend !== undefined && (
        <div className="flex items-center gap-1.5 mt-3">
          {trend > 0 ? (
            <ArrowUp size={16} className="text-green-400" />
          ) : (
            <ArrowDown size={16} className="text-red-400" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {Math.abs(trend)}% {trendLabel || 'vs last month'}
          </span>
        </div>
      )}
    </motion.div>
  )
}

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

export default function Dashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [trends, setTrends] = useState([])
  const [categories, setCategories] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAnalyticsSummary(),
      getAnalyticsTrends(),
      getAnalyticsCategories(),
    ]).then(([s, t, c]) => {
      setData(s)
      setTrends(t)
      setCategories(c)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const kpiCards = [
    { label: 'Total Agents', value: data?.total_agents ?? '—', icon: Users,
      color: 'bg-blue-500/10 text-blue-400', trend: 12 },
    { label: 'Total Calls', value: data?.total_calls ?? '—', icon: Phone,
      color: 'bg-purple-500/10 text-purple-400', trend: data?.calls_this_week ? 8 : undefined, trendLabel: 'this week' },
    { label: 'Average QA Score', value: data ? `${data.avg_score}%` : '—', icon: Star,
      color: 'bg-green-500/10 text-green-400', trend: 5.2 },
    { label: 'Critical Errors', value: data?.critical_errors ?? '—', icon: AlertTriangle,
      color: 'bg-red-500/10 text-red-400', trend: undefined },
  ]

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

  const pieData = [
    { name: 'Clean', value: (data?.total_calls || 1) - (data?.critical_errors || 0) },
    { name: 'Critical', value: data?.critical_errors || 0 },
  ].filter(d => d.value > 0)

  return (
    <PageTransition>
      <div className="space-y-8">
        <Greeting />

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {kpiCards.map((card, i) => (
              <KpiCard key={card.label} {...card} delay={0.05 * i} />
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-[#FAFAFA] mb-5 flex items-center gap-2">
              <TrendingUp size={20} className="text-accent" /> Score Trend
            </h2>
            {trends.length === 0 ? (
              <p className="text-base text-[#52525B] py-12 text-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
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
            transition={{ delay: 0.25 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-[#FAFAFA] mb-5">Category Performance</h2>
            {catData.length === 0 ? (
              <p className="text-base text-[#52525B] py-12 text-center">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={catData} layout="vertical" margin={{ left: 100 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#52525B" fontSize={13} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                    {catData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h2 className="text-lg font-semibold text-[#FAFAFA] mb-5">Critical Errors</h2>
            {pieData.length === 0 ? (
              <p className="text-base text-[#52525B] py-12 text-center">No data yet</p>
            ) : (
              <div className="flex items-center gap-8">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75}
                      dataKey="value" startAngle={90} endAngle={-270}>
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.name === 'Clean' ? '#22C55E' : '#EF4444'} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {pieData.map(e => (
                    <div key={e.name} className="flex items-center gap-2.5 text-base">
                      <div className={`w-4 h-4 rounded-full ${e.name === 'Clean' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-[#A1A1AA]">{e.name}: <strong className="text-[#FAFAFA] text-lg">{e.value}</strong></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {[
            { title: 'View Agents', desc: 'Manage agents and their evaluations', path: '/agents', delay: 0.35 },
            { title: 'Upload Call', desc: 'Upload a new call recording for evaluation', path: '/upload', delay: 0.4 },
          ].map((item) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: item.delay }}
              onClick={() => navigate(item.path)}
              className="card p-6 card-hover cursor-pointer"
            >
              <p className="text-xl font-semibold text-[#FAFAFA]">{item.title}</p>
              <p className="text-base text-[#A1A1AA] mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </PageTransition>
  )
}
