import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileAudio, X, Loader2, Search, ChevronDown, Check, AlertCircle } from 'lucide-react'
import { listDepartments, listAgentsByDepartment } from '../services/api'

export default function UploadForm({ onEvaluate, loading, error }) {
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [depts, setDepts] = useState([])
  const [agents, setAgents] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [agentId, setAgentId] = useState('')
  const [agentSearch, setAgentSearch] = useState('')
  const [notes, setNotes] = useState('')
  const [showDeptDropdown, setShowDeptDropdown] = useState(false)
  const [showAgentDropdown, setShowAgentDropdown] = useState(false)
  const [deptSearch, setDeptSearch] = useState('')
  const [touched, setTouched] = useState({})
  const inputRef = useRef(null)
  const agentRef = useRef(null)
  const deptRef = useRef(null)

  useEffect(() => {
    listDepartments().then(setDepts).catch(() => {})
  }, [])

  useEffect(() => {
    if (departmentId) {
      listAgentsByDepartment(departmentId).then(setAgents).catch(() => setAgents([]))
      setAgentId('')
      setAgentSearch('')
    } else {
      setAgents([])
      setAgentId('')
    }
  }, [departmentId])

  useEffect(() => {
    const handle = (e) => {
      if (agentRef.current && !agentRef.current.contains(e.target)) setShowAgentDropdown(false)
      if (deptRef.current && !deptRef.current.contains(e.target)) setShowDeptDropdown(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const filteredDepts = depts.filter(d =>
    !deptSearch || d.name.toLowerCase().includes(deptSearch.toLowerCase())
  )

  const filteredAgents = agents.filter(a =>
    !agentSearch || a.name.toLowerCase().includes(agentSearch.toLowerCase())
  )

  const selectedAgent = agents.find(a => a.id === agentId)
  const selectedDept = depts.find(d => d.id === departmentId)

  const errors = {}
  if (touched.department && !departmentId) errors.department = 'Please select a department.'
  if (touched.agent && !agentId) errors.agent = 'Please select an agent.'
  if (touched.file && !file) errors.file = 'Please upload an audio file.'

  const allValid = departmentId && agentId && file

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f && f.type.startsWith('audio/')) setFile(f)
  }, [])

  const handleSelect = (e) => {
    if (e.target.files[0]) setFile(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched({ department: true, agent: true, file: true })
    if (!allValid) return
    if (file) onEvaluate(file, { agent_id: agentId, department_id: departmentId, notes })
  }

  return (
    <div className="card p-8">
      <h2 className="text-xl font-bold text-[#FAFAFA] mb-2">Upload Call Recording</h2>
      <p className="text-base text-[#A1A1AA] mb-8">Upload a call recording and let EchoPeak analyze it for quality intelligence</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div ref={deptRef} className="relative">
            <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Department *</label>
            <div
              onClick={() => setShowDeptDropdown(!showDeptDropdown)}
              className="input-dark flex items-center justify-between cursor-pointer"
            >
              <span className={selectedDept ? 'text-[#FAFAFA]' : 'text-[#52525B]'}>
                {selectedDept ? selectedDept.name : 'Select Department'}
              </span>
              <ChevronDown size={16} className="text-[#52525B]" />
            </div>
            {errors.department && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.department}
              </p>
            )}
            {showDeptDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-surface-border bg-surface-sidebar shadow-2xl z-50 max-h-60 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-surface-sidebar border-b border-surface-border">
                  <input
                    type="text" placeholder="Search department..."
                    value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)}
                    className="input-dark w-full text-sm" autoFocus
                  />
                </div>
                {filteredDepts.length === 0 ? (
                  <p className="text-sm text-[#52525B] text-center py-4">No departments found</p>
                ) : filteredDepts.map(d => (
                  <button type="button" key={d.id}
                    onClick={() => { setDepartmentId(d.id); setDeptSearch(''); setShowDeptDropdown(false); setTouched(t => ({...t, department: true})) }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-hover transition-colors flex items-center justify-between ${d.id === departmentId ? 'bg-accent/10 text-accent-light' : 'text-[#D4D4D8]'}`}
                  >
                    {d.name}
                    {d.id === departmentId && <Check size={16} className="text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div ref={agentRef} className="relative">
            <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Agent *</label>
            <div
              onClick={() => { if (departmentId) setShowAgentDropdown(!showAgentDropdown) }}
              className="input-dark flex items-center justify-between cursor-pointer"
            >
              <span className={selectedAgent ? 'text-[#FAFAFA]' : 'text-[#52525B]'}>
                {selectedAgent ? selectedAgent.name : (departmentId ? 'Search or Select Agent' : 'Select department first')}
              </span>
              <Search size={16} className="text-[#52525B]" />
            </div>
            {errors.agent && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.agent}
              </p>
            )}
            {showAgentDropdown && departmentId && (
              <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-surface-border bg-surface-sidebar shadow-2xl z-50 max-h-60 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-surface-sidebar border-b border-surface-border">
                  <input
                    type="text" placeholder="Search agent..."
                    value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)}
                    className="input-dark w-full text-sm" autoFocus
                  />
                </div>
                {filteredAgents.length === 0 ? (
                  <p className="text-sm text-[#52525B] text-center py-4">No agents found</p>
                ) : filteredAgents.map(a => (
                  <button type="button" key={a.id}
                    onClick={() => { setAgentId(a.id); setAgentSearch(''); setShowAgentDropdown(false); setTouched(t => ({...t, agent: true})) }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-surface-hover transition-colors flex items-center justify-between ${a.id === agentId ? 'bg-accent/10 text-accent-light' : 'text-[#D4D4D8]'}`}
                  >
                    {a.name}
                    {a.id === agentId && <Check size={16} className="text-accent" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`relative overflow-hidden rounded-2xl border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-200 ${
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
              <FileAudio size={48} className="text-accent mx-auto" />
              <p className="text-base text-[#FAFAFA] font-medium">{file.name}</p>
              <p className="text-sm text-[#A1A1AA]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setTouched(t => ({...t, file: false})) }}
                className="btn-ghost text-red-400 hover:text-red-300 mx-auto flex items-center gap-1.5"
              >
                <X size={16} /> Remove
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto">
                <Upload size={28} className="text-[#52525B]" />
              </div>
              <p className="text-base text-[#A1A1AA] font-medium">
                {dragOver ? 'Drop your file here' : 'Drop audio file here or click to browse'}
              </p>
              <p className="text-sm text-[#52525B]">WAV, MP3, M4A — up to 100 MB</p>
            </div>
          )}
        </div>
        {errors.file && (
          <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {errors.file}
          </p>
        )}

        <div>
          <label className="block text-sm font-medium text-[#A1A1AA] mb-2">Notes (Optional)</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
            className="input-dark w-full" rows={2} placeholder="Customer complaint call, High priority review, Training call..."
          />
        </div>

        <AnimatePresence>
          {allValid && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-2xl bg-surface-hover border border-surface-border overflow-hidden"
            >
              <div className="p-4 border-b border-surface-border">
                <p className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">Upload Summary</p>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#52525B] w-24">Department:</span>
                  <span className="text-[#FAFAFA] font-medium">{selectedDept?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#52525B] w-24">Agent:</span>
                  <span className="text-[#FAFAFA] font-medium">{selectedAgent?.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-[#52525B] w-24">File:</span>
                  <span className="text-[#FAFAFA] font-medium truncate">{file?.name}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 text-base p-4 rounded-xl"
          >
            {error}
          </motion.div>
        )}

        <button
          type="submit"
          disabled={!allValid || loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg"
        >
          {loading ? (
            <><Loader2 size={20} className="animate-spin" /> Uploading & Evaluating...</>
          ) : (
            <><Upload size={20} /> Start Evaluation</>
          )}
        </button>
      </form>
    </div>
  )
}
