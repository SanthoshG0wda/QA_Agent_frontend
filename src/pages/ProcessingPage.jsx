import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getCallStatus } from '../services/api'
import PageTransition from '../components/PageTransition'
import { Loader2, CheckCircle2, XCircle, AlertCircle, Mic, Users, Brain, ShieldAlert } from 'lucide-react'

const STEPS = [
  { key: 'transcription', label: 'Transcription', icon: Mic },
  { key: 'speaker_detection', label: 'Speaker Detection', icon: Users },
  { key: 'qa_evaluation', label: 'QA Evaluation', icon: Brain },
  { key: 'error_analysis', label: 'Critical Error Analysis', icon: ShieldAlert },
]

function getStepStatus(stepIndex, elapsedMs) {
  const stepDuration = 4000
  const stepTime = elapsedMs - stepIndex * stepDuration
  if (stepTime < 0) return 'pending'
  if (stepTime < stepDuration) return 'processing'
  return 'completed'
}

export default function ProcessingPage() {
  const { callId } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('processing')
  const [evaluationId, setEvaluationId] = useState(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const pollRef = useRef(null)
  const elapsedRef = useRef(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    elapsedRef.current = setInterval(() => {
      if (mountedRef.current) setElapsed(e => e + 200)
    }, 200)

    const poll = async () => {
      try {
        const data = await getCallStatus(callId)
        if (!mountedRef.current) return

        if (data.status === 'completed') {
          setStatus('completed')
          setEvaluationId(data.evaluation_id)
          clearInterval(pollRef.current)
          clearInterval(elapsedRef.current)
          setTimeout(() => {
            if (mountedRef.current) navigate(`/results/${data.evaluation_id}`)
          }, 1500)
          return
        }

        if (data.status === 'failed') {
          setStatus('failed')
          setError(data.error || 'Processing failed')
          clearInterval(pollRef.current)
          clearInterval(elapsedRef.current)
          return
        }

        setStatus('processing')
      } catch {
        if (!mountedRef.current) return
        setError('Failed to check processing status')
      }
    }

    poll()
    pollRef.current = setInterval(poll, 2000)

    return () => {
      mountedRef.current = false
      clearInterval(pollRef.current)
      clearInterval(elapsedRef.current)
    }
  }, [callId, navigate])

  const handleRetry = () => {
    navigate('/upload')
  }

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-10 text-center"
        >
          <AnimatePresence mode="wait">
            {status === 'completed' ? (
              <motion.div
                key="completed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={48} className="text-green-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#FAFAFA]">Analysis Complete!</h2>
                  <p className="text-[#A1A1AA] mt-2">Redirecting to evaluation results...</p>
                </div>
              </motion.div>
            ) : status === 'failed' ? (
              <motion.div
                key="failed"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-6"
              >
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
                  <XCircle size={48} className="text-red-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-[#FAFAFA]">Analysis Failed</h2>
                  <p className="text-red-400 mt-2">{error || 'An error occurred during processing.'}</p>
                </div>
                <button onClick={handleRetry} className="btn-primary">
                  Try Again
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                    <Loader2 size={36} className="text-accent animate-spin" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#FAFAFA]">Analyzing Call...</h2>
                  <p className="text-[#A1A1AA]">Please wait while the AI processes your recording.</p>
                </div>

                <div className="space-y-3 max-w-md mx-auto text-left">
                  {STEPS.map((step, i) => {
                    const stepStatus = getStepStatus(i, elapsed)
                    const Icon = step.icon
                    return (
                      <motion.div
                        key={step.key}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-4 p-3 rounded-xl ${
                          stepStatus === 'completed'
                            ? 'bg-green-500/5'
                            : stepStatus === 'processing'
                              ? 'bg-accent/5'
                              : 'opacity-40'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          stepStatus === 'completed'
                            ? 'bg-green-500/10 text-green-400'
                            : stepStatus === 'processing'
                              ? 'bg-accent/10 text-accent'
                              : 'bg-[#52525B]/10 text-[#52525B]'
                        }`}>
                          {stepStatus === 'completed' ? (
                            <CheckCircle2 size={18} />
                          ) : stepStatus === 'processing' ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Icon size={16} />
                          )}
                        </div>
                        <span className={`text-base font-medium ${
                          stepStatus === 'completed'
                            ? 'text-green-400'
                            : stepStatus === 'processing'
                              ? 'text-[#FAFAFA]'
                              : 'text-[#A1A1AA]'
                        }`}>
                          {step.label}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-[#52525B]">
                  <AlertCircle size={14} />
                  <span>This usually takes 20–30 seconds</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </PageTransition>
  )
}
