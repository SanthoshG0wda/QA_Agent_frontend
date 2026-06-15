import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="card p-6 w-full max-w-sm mx-auto shadow-2xl">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title || 'Confirm'}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mt-1">{message}</p>
                </div>
                <button onClick={onCancel} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-0.5">
                  <X size={18} />
                </button>
              </div>
              <div className="flex gap-3 justify-end">
                <button onClick={onCancel} className="btn-ghost px-4 py-2 text-sm">
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
                >
                  {confirmLabel || 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
