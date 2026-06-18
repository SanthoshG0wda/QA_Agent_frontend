import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getAgent, uploadAgentAudio } from '../services/api'
import PageTransition from '../components/PageTransition'
import { CardSkeleton } from '../components/Skeleton'
import {
  ArrowLeft, Upload, FileAudio, X, Loader2, User, Building2
} from 'lucide-react'

export default function AgentUpload() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [agent, setAgent] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    getAgent(id).then(setAgent).catch(() => navigate('/agents'))
  }, [id, navigate])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('audio/')) {
      setFile(f)
      setError('')
    } else {
      setError('Please select an audio file')
    }
  }, [])

  const handleSelect = (e) => {
    const f = e.target.files[0]
    if (f) { setFile(f); setError('') }
  }

  const handleUpload = async () => {
    if (!file) { setError('Please select an audio file'); return }
    setLoading(true)
    setError('')
    try {
      const data = await uploadAgentAudio(id, file)
      navigate(`/processing/${data.call_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload and evaluation failed')
      setLoading(false)
    }
  }

  if (!agent) {
    return (
      <PageTransition>
        <CardSkeleton />
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="max-w-3xl mx-auto space-y-8">
        <button onClick={() => navigate(`/agents/${id}`)} className="btn-ghost flex items-center gap-2">
          <ArrowLeft size={18} /> Back to {agent.name}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-purple-600/20 flex items-center justify-center text-accent-light font-bold text-xl border border-accent/10">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary">Upload Call for {agent.name}</h1>
              <p className="text-base text-secondary flex items-center gap-2">
                <Building2 size={16} /> {agent.department || 'General'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-base p-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-16 text-center cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-accent bg-accent/5'
                : file
                  ? 'border-accent/50 bg-accent/5'
                  : 'border-surface-border hover:border-accent/30 hover:bg-surface-hover'
            }`}
          >
            <input type="file" accept="audio/*" onChange={handleSelect} className="hidden" id="agent-file" />
            <label htmlFor="agent-file" className="cursor-pointer">
              {file ? (
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
                  <FileAudio size={56} className="text-accent mx-auto" />
                  <p className="text-lg text-primary font-medium">{file.name}</p>
                  <p className="text-sm text-secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto">
                    <Upload size={36} className="text-muted" />
                  </div>
                  <p className="text-lg text-secondary font-medium">
                    {dragOver ? 'Drop your file here' : 'Drop audio file here or click to browse'}
                  </p>
                  <p className="text-sm text-muted">WAV, MP3, M4A, OGG</p>
                </div>
              )}
            </label>
          </div>

          {file && (
            <button
              onClick={() => setFile(null)}
              className="btn-ghost text-red-400 hover:text-red-300 mx-auto flex items-center gap-1.5 mt-3"
            >
              <X size={16} /> Remove file
            </button>
          )}

          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-lg py-4"
          >
            {loading ? (
              <><Loader2 size={20} className="animate-spin" /> Evaluating Call...</>
            ) : (
              <><Upload size={20} /> Evaluate Call</>
            )}
          </button>
        </motion.div>
      </div>
    </PageTransition>
  )
}
