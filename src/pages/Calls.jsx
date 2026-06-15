import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getCalls, deleteCall } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import ConfirmModal from '../components/ConfirmModal'
import PageTransition from '../components/PageTransition'
import { Phone, Trash2, ExternalLink, Calendar, FileAudio } from 'lucide-react'

export default function Calls() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [calls, setCalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => {
    setLoading(true)
    getCalls().then(setCalls).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteCall(deleteTarget)
    setDeleteTarget(null)
    load()
  }

  return (
    <PageTransition>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Call"
        message="Are you sure you want to delete this call? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
            <Phone size={28} className="text-accent" /> Calls
          </h1>
          <p className="text-base text-[var(--text-secondary)] mt-2">View all uploaded call recordings</p>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : calls.length === 0 ? (
          <EmptyState
            title="No calls found"
            description="Upload a call recording to get started."
            actionLabel="Upload Call"
            onAction={() => navigate('/upload')}
          />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-[#A1A1AA] text-left border-b border-surface-border">
                    <th className="p-4 font-medium">File</th>
                        <th className="p-4 font-medium">Status</th>
                        <th className="p-4 font-medium">Date</th>
                        <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((c, i) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-surface-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2.5 text-[#D4D4D8]">
                          <FileAudio size={18} className="text-[#52525B]" />
                          <span className="font-medium">{c.filename}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          c.processing_status === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : c.processing_status === 'processing'
                              ? 'bg-yellow-500/10 text-yellow-400'
                              : c.processing_status === 'failed'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-[#52525B]/10 text-[#A1A1AA]'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            c.processing_status === 'completed'
                              ? 'bg-green-400'
                              : c.processing_status === 'processing'
                                ? 'bg-yellow-400 animate-pulse'
                                : c.processing_status === 'failed'
                                  ? 'bg-red-400'
                                  : 'bg-[#A1A1AA]'
                          }`} />
                          {c.processing_status || 'unknown'}
                        </span>
                      </td>
                      <td className="p-4 text-[#A1A1AA]">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-[#52525B]" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4 flex gap-3">
                        <button onClick={() => navigate(`/results/${c.id}`)}
                          className="btn-ghost text-accent-light hover:text-accent flex items-center gap-1.5"
                        >
                          <ExternalLink size={16} /> View
                        </button>
                        {c.processing_status === 'processing' && (
                          <span className="text-xs text-yellow-400 animate-pulse">Processing...</span>
                        )}
                        {user?.role === 'admin' && (
                          <button onClick={() => setDeleteTarget(c.id)}
                            className="btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1.5"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        )}
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
