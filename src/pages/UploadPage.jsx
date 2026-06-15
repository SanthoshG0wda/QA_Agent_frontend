import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadAudio } from '../services/api'
import UploadForm from '../components/UploadForm'
import EvaluationList from '../components/EvaluationList'
import PageTransition from '../components/PageTransition'
import { Upload, CheckCircle2, ExternalLink, RefreshCw, Clock, FileText } from 'lucide-react'

export default function UploadPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastResult, setLastResult] = useState(null)

  const handleUpload = async (file, extra = {}) => {
    setLoading(true)
    setError('')
    try {
      const data = await uploadAudio(file, extra)
      setLastResult(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    }
    setLoading(false)
  }

  const handleUploadAnother = () => {
    setLastResult(null)
    setError('')
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
            <Upload size={28} className="text-accent" /> Upload Call
          </h1>
          <p className="text-base text-[#A1A1AA] mt-2">Upload a call recording for EchoPeak AI analysis</p>
        </div>

        <AnimatePresence mode="wait">
          {lastResult ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="card p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                <CheckCircle2 size={48} className="text-green-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[#FAFAFA]">Call uploaded successfully</h2>
                <p className="text-[#A1A1AA] mt-2">
                  Evaluation started in background. You can leave this page and continue uploading additional calls.
                </p>
              </div>
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-surface-hover text-left">
                <FileText size={20} className="text-accent" />
                <div>
                  <p className="text-sm text-[#A1A1AA]">Job ID</p>
                  <p className="text-base font-semibold text-[#FAFAFA]">{lastResult.job_id}</p>
                </div>
                <div className="w-px h-8 bg-surface-border" />
                <div>
                  <p className="text-sm text-[#A1A1AA]">Status</p>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-yellow-400" />
                    <span className="text-base font-semibold text-yellow-400 capitalize">{lastResult.status}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => navigate(`/processing/${lastResult.call_id}`)}
                  className="btn-primary flex items-center gap-2"
                >
                  <ExternalLink size={18} /> View Progress
                </button>
                <button
                  onClick={handleUploadAnother}
                  className="btn-ghost text-[#A1A1AA] hover:text-[#FAFAFA] flex items-center gap-2"
                >
                  <RefreshCw size={18} /> Upload Another Call
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
            >
              <UploadForm onEvaluate={handleUpload} loading={loading} error={error} />
              {!loading && <EvaluationList />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
