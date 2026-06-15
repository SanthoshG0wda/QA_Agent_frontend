import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, X, ExternalLink } from 'lucide-react'

let toastId = 0
let addToastFn = null

export function showNotificationToast(title, message, evaluationId) {
  if (addToastFn) {
    addToastFn({ id: ++toastId, title, message, evaluationId })
  }
}

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(880, ctx.currentTime)
    oscillator.frequency.setValueAtTime(1100, ctx.currentTime + 0.1)
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + 0.4)
  } catch {}
}

export default function NotificationToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const navigate = useNavigate()

  addToastFn = useCallback((toast) => {
    playNotificationSound()
    setToasts(prev => [...prev, toast])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 5000)
  }, [])

  const dismiss = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  return (
    <>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 w-80">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 80, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.95 }}
              className="bg-surface-sidebar border border-accent/20 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle size={16} className="text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#FAFAFA]">{toast.title}</p>
                      <p className="text-xs text-[#A1A1AA] mt-0.5 whitespace-pre-line">{toast.message}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {toast.evaluationId && (
                      <button
                        onClick={() => { dismiss(toast.id); navigate(`/results/${toast.evaluationId}`) }}
                        className="p-1.5 rounded-lg hover:bg-surface-hover text-accent-light hover:text-accent transition-colors"
                      >
                        <ExternalLink size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => dismiss(toast.id)}
                      className="p-1.5 rounded-lg hover:bg-surface-hover text-[#52525B] hover:text-[#A1A1AA] transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
