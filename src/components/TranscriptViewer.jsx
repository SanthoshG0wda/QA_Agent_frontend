import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, User, Bot } from 'lucide-react'

function ConversationView({ conversation }) {
  if (!conversation || !conversation.length) return null

  return (
    <div className="space-y-3">
      {conversation.map((msg, i) => {
        const isAgent = msg.speaker === 'Agent'
        const side = isAgent ? '' : 'flex-row-reverse'
        const bubbleBg = isAgent
          ? 'bg-accent/10 border border-accent/10'
          : 'bg-purple-500/10 border border-purple-500/10'
        const iconColor = isAgent ? 'bg-accent/20' : 'bg-purple-500/20'
        const labelColor = isAgent ? 'text-accent-light' : 'text-purple-400'

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.02 * i }}
            className={`flex gap-3 ${side}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${iconColor}`}>
              {isAgent
                ? <Bot size={16} className="text-accent-light" />
                : <User size={16} className="text-purple-400" />
              }
            </div>
            <div className="max-w-[80%]">
              <div className={`rounded-xl px-4 py-3 text-sm leading-relaxed ${bubbleBg}`}>
                <p className={`text-[11px] font-semibold mb-1.5 uppercase tracking-wider ${labelColor}`}>
                  {msg.speaker}
                </p>
                <p>{msg.text}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

function ChatView({ text }) {
  if (!text) return null
  const lines = text.split('\n').filter(Boolean)
  return (
    <div className="space-y-1">
      {lines.map((line, i) => (
        <p key={i} className="text-sm text-[#D4D4D8] leading-relaxed py-1">{line}</p>
      ))}
    </div>
  )
}

export default function TranscriptViewer({ transcript, diarized, agentCustomer, normalizedConversation, correctedConversation }) {
  const [tab, setTab] = useState('agent_customer')

  const hasCorrected = correctedConversation && correctedConversation.length > 0
  const hasNormalized = normalizedConversation && normalizedConversation.length > 0

  const tabs = [
    { key: 'agent_customer', label: 'Agent / Customer', conversation: hasCorrected ? correctedConversation : hasNormalized ? normalizedConversation : null, text: !hasCorrected && !hasNormalized ? agentCustomer : null },
    { key: 'diarized', label: 'Diarized', text: diarized },
    { key: 'plain', label: 'Transcript', text: transcript },
  ]

  const available = tabs.filter((t) => t.conversation || t.text)

  if (!available.length) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold text-[#FAFAFA] mb-2 flex items-center gap-2">
          <MessageSquare size={16} /> Transcript
        </h3>
        <p className="text-sm text-[#52525B]">No transcript available</p>
      </div>
    )
  }

  const active = available.find((t) => t.key === tab) || available[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card overflow-hidden"
    >
      <div className="p-4 border-b border-surface-border">
        <h3 className="font-semibold text-[#FAFAFA] flex items-center gap-2">
          <MessageSquare size={16} /> Transcript
        </h3>
      </div>
      <div className="flex gap-1 px-4 pt-3 border-b border-surface-border">
        {available.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-all duration-200 ${
              t.key === active.key
                ? 'border-accent text-accent-light'
                : 'border-transparent text-[#52525B] hover:text-[#A1A1AA]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {!hasCorrected && !hasNormalized && !agentCustomer && (
        <p className="text-xs text-yellow-500 px-4 pt-2">
          Speaker diarization unavailable for this recording.
        </p>
      )}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {active.conversation
          ? <ConversationView conversation={active.conversation} />
          : <ChatView text={active.text} />
        }
      </div>
    </motion.div>
  )
}
