import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell, CheckCheck, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { getUnreadCount, listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api'
import { showNotificationToast } from './NotificationToast'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [notifs, setNotifs] = useState([])
  const prevCountRef = useRef(0)
  const ref = useRef(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    try {
      const [c, n] = await Promise.all([getUnreadCount(), listNotifications()])
      if (c.count > prevCountRef.current) {
        const newNotifs = n.filter(x => !x.read)
        if (newNotifs.length > 0) {
          const latest = newNotifs[0]
          showNotificationToast(
            latest.title || 'Evaluation Completed',
            latest.message || 'New notification',
            latest.evaluation_id,
          )
        }
      }
      prevCountRef.current = c.count
      setCount(c.count)
      setNotifs(n.slice(0, 10))
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  useEffect(() => {
    const handle = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleClick = async (n) => {
    try { await markNotificationRead(n.id) } catch {}
    setOpen(false)
    navigate(`/results/${n.evaluation_id}`)
  }

  const handleMarkAll = async () => {
    try { await markAllNotificationsRead() } catch {}
    setCount(0)
    setNotifs(notifs.map(n => ({ ...n, read: true })))
  }

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(!open); load() }} className="relative p-2 rounded-xl text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-surface-hover transition-all">
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full mt-2 w-80 rounded-2xl glass border border-surface-border shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-surface-border flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#FAFAFA]">Notifications</h3>
              {count > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-accent-light hover:text-accent flex items-center gap-1">
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifs.length === 0 ? (
                <p className="text-sm text-[#52525B] text-center py-8">No notifications</p>
              ) : notifs.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left p-4 border-b border-surface-border hover:bg-surface-hover transition-colors ${!n.read ? 'bg-accent/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[#FAFAFA] truncate">{n.title}</p>
                      <p className="text-xs text-[#A1A1AA] mt-1 whitespace-pre-line">{n.message}</p>
                      <p className="text-[10px] text-[#52525B] mt-1">
                        {n.created_at ? formatRelative(n.created_at) : ''}
                      </p>
                    </div>
                    <ExternalLink size={14} className="text-accent shrink-0 mt-1" />
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatRelative(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}
