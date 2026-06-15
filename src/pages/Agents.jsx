import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listAgents } from '../services/api'
import AgentCard from '../components/AgentCard'
import PageTransition from '../components/PageTransition'
import EmptyState from '../components/EmptyState'
import { CardSkeleton } from '../components/Skeleton'
import { Users, Plus } from 'lucide-react'

export default function Agents() {
  const navigate = useNavigate()
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listAgents()
      .then(setAgents)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
              <Users size={28} className="text-accent" /> Agents
            </h1>
            <p className="text-base text-[#A1A1AA] mt-2">Manage your team and monitor their performance</p>
          </div>
          <button onClick={() => navigate('/agents/new')} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add Agent
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : agents.length === 0 ? (
          <EmptyState
            title="No agents yet"
            description="Create your first agent to start tracking call quality and performance."
            actionLabel="Add Agent"
            onAction={() => navigate('/agents/new')}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {agents.map((agent, i) => (
              <AgentCard key={agent.id} agent={agent} index={i} />
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  )
}
