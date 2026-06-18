import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { listJobs } from '../services/api'
import PageTransition from '../components/PageTransition'
import { TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { Briefcase, ExternalLink, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

export default function Jobs() {
  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const pollRef = useRef(null)

  const hasPending = jobs.some(j => j.status === 'processing' || j.status === 'queued' || j.status === 'pending')

  const load = () => {
    listJobs()
      .then(setJobs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    pollRef.current = setInterval(load, 3000)
    return () => clearInterval(pollRef.current)
  }, [])

  useEffect(() => {
    if (!hasPending && pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [hasPending])

  const statusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={18} className="text-green-400" />
      case 'processing': return <Loader2 size={18} className="text-yellow-400 animate-spin" />
      case 'failed': return <XCircle size={18} className="text-red-400" />
      default: return <Clock size={18} className="text-muted" />
    }
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
            <Briefcase size={28} className="text-accent" /> Jobs
            {hasPending && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                Live
              </span>
            )}
          </h1>
          <p className="text-base text-secondary mt-2">Track evaluation job statuses in real time</p>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs yet"
            description="Upload a call to create your first evaluation job."
            actionLabel="Upload Call"
            onAction={() => navigate('/upload')}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-secondary text-left border-b border-surface-border">
                    <th className="p-4 font-medium">Job ID</th>
                    <th className="p-4 font-medium">Agent</th>
                    <th className="p-4 font-medium">Department</th>
                    <th className="p-4 font-medium">File</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Progress</th>
                    <th className="p-4 font-medium">Created</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job, i) => (
                    <motion.tr
                      key={job.job_id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-surface-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="p-4 font-mono text-sm text-accent-light font-medium">{job.job_id}</td>
                      <td className="p-4 text-[#D4D4D8]">{job.agent_name || '-'}</td>
                      <td className="p-4 text-[#D4D4D8]">{job.department_name || '-'}</td>
                      <td className="p-4 text-[#D4D4D8] max-w-[200px] truncate">{job.filename}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : job.status === 'processing'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : job.status === 'failed'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-[#52525B]/10 text-secondary'
                        }`}>
                          {statusIcon(job.status)}
                          {job.status || 'pending'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-surface-hover overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${
                              job.progress === 100 ? 'bg-green-400' : 'bg-yellow-400'
                            }`} style={{ width: `${job.progress}%` }} />
                          </div>
                          <span className="text-xs text-secondary">{job.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-secondary text-sm">
                        {job.created_at ? new Date(job.created_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => navigate(`/processing/${job.call_id}`)}
                          className="btn-ghost text-accent-light hover:text-accent flex items-center gap-1.5"
                        >
                          <ExternalLink size={16} /> Track
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
