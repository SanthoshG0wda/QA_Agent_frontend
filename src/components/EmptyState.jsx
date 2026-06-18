import { motion } from 'framer-motion'
import { Inbox } from 'lucide-react'

export default function EmptyState({ title, description, action, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-16 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-surface-hover flex items-center justify-center mx-auto mb-6">
        <Inbox size={40} className="text-muted" />
      </div>
      <h3 className="text-2xl font-semibold text-primary mb-2">{title}</h3>
      <p className="text-base text-secondary mb-8 max-w-md mx-auto">{description}</p>
      {action && (
        <button onClick={onAction} className="btn-primary">
          {actionLabel || action}
        </button>
      )}
    </motion.div>
  )
}
