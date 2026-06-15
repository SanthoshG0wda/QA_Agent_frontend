import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileAudio, X, Loader2 } from 'lucide-react'

export default function UploadForm({ onEvaluate, loading, error }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('audio/')) {
      setFile(f)
    }
  }, [])

  const handleSelect = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (file) onEvaluate(file)
  }

  return (
    <div className="card p-8">
      <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Upload Call Recording</h2>
      <p className="text-base text-[#A1A1AA] mb-8">Upload an audio file to analyze and evaluate call quality</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          onClick={() => inputRef.current?.click()}
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
          <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={handleSelect} />
          {file ? (
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-3">
              <FileAudio size={56} className="text-accent mx-auto" />
              <p className="text-lg text-[#FAFAFA] font-medium">{file.name}</p>
              <p className="text-sm text-[#A1A1AA]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                className="btn-ghost text-red-400 hover:text-red-300 mx-auto flex items-center gap-1.5"
              >
                <X size={16} /> Remove
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto">
                <Upload size={36} className="text-[#52525B]" />
              </div>
              <p className="text-lg text-[#A1A1AA] font-medium">
                {dragOver ? 'Drop your file here' : 'Drop audio file here or click to browse'}
              </p>
              <p className="text-sm text-[#52525B]">WAV, MP3, M4A, OGG — up to 100 MB</p>
            </div>
          )}
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 text-base p-4 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!file || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Evaluating Call...</>
          ) : (
            <><Upload size={20} /> Evaluate Call</>
          )}
        </button>
      </form>
    </div>
  )
}
