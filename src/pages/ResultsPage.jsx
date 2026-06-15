import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getEvaluation, getCallEvaluation, getCallStatus } from '../services/api'
import ScoreCard from '../components/ScoreCard'
import TranscriptViewer from '../components/TranscriptViewer'
import { EvalSkeleton } from '../components/Skeleton'
import PageTransition from '../components/PageTransition'
import { ArrowLeft, User, Building2, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function ResultsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [evaluation, setEvaluation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [pollCount, setPollCount] = useState(0)

  useEffect(() => {
    if (!id) {
      setError('No ID provided')
      setLoading(false)
      return
    }
    let cancelled = false

    const fetchData = async () => {
      try {
        const status = await getCallStatus(id)
        if (cancelled) return
        const data = await getCallEvaluation(id)
        if (cancelled) return
        if (data.processing_status === 'processing' || data.processing_status === 'pending') {
          if (pollCount < 30) {
            setTimeout(() => setPollCount(p => p + 1), 2000)
            if (!cancelled) setLoading(true)
            return
          }
        }
        if (!cancelled) setEvaluation(data)
      } catch {
        if (cancelled) return
        try {
          const data = await getEvaluation(id)
          if (!cancelled) setEvaluation(data)
        } catch {
          if (!cancelled) setError('Evaluation not found')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [id, pollCount])

  if (loading) {
    return (
      <PageTransition>
        <EvalSkeleton />
      </PageTransition>
    )
  }

  if (error || !evaluation) {
    return (
      <PageTransition>
        <div className="text-center py-24">
          <p className="text-red-400 text-lg mb-6">{error || 'Evaluation not found'}</p>
          <button onClick={() => navigate('/calls')} className="btn-primary">View calls</button>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-8">
        <button onClick={() => navigate('/calls')} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} /> Back to Calls
        </button>

        {evaluation.processing_status && evaluation.processing_status !== 'completed' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-8 text-center"
          >
            {evaluation.processing_status === 'processing' ? (
              <div className="space-y-4">
                <Clock size={48} className="text-yellow-400 animate-pulse mx-auto" />
                <p className="text-yellow-400 text-lg font-medium">Processing call...</p>
                <p className="text-[#A1A1AA]">Results will appear automatically when ready.</p>
              </div>
            ) : evaluation.processing_status === 'failed' ? (
              <div className="space-y-4">
                <XCircle size={48} className="text-red-400 mx-auto" />
                <p className="text-red-400 text-lg font-medium">Processing failed</p>
                <p className="text-[#A1A1AA]">Please try uploading the call again.</p>
              </div>
            ) : null}
          </motion.div>
        ) : (
          <>
            {evaluation.agent_name && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex items-center gap-5"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center text-accent-light font-bold text-xl border border-accent/10">
                  {evaluation.agent_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-[#FAFAFA] flex items-center gap-2">
                    <User size={18} className="text-accent" /> {evaluation.agent_name}
                  </p>
                  <p className="text-sm text-[#A1A1AA] flex items-center gap-1">
                    <Building2 size={14} /> {evaluation.agent_department || 'Agent'}
                  </p>
                </div>
              </motion.div>
            )}

            <ScoreCard evaluation={evaluation} />
            <TranscriptViewer
              transcript={evaluation.transcript}
              diarized={evaluation.diarized_transcript}
              agentCustomer={evaluation.agent_customer_transcript}
              normalizedConversation={evaluation.normalized_conversation}
              correctedConversation={evaluation.corrected_conversation}
            />
          </>
        )}
      </div>
    </PageTransition>
  )
}
