import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import PageTransition from '../components/PageTransition'
import { User, Mail, Shield, Headphones } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  const details = [
    { label: 'Name', value: user?.name, icon: User },
    { label: 'Email', value: user?.email, icon: Mail },
    { label: 'Role', value: user?.role, icon: Shield },
  ]

  return (
    <PageTransition>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Profile</h1>
          <p className="text-base text-secondary mt-2">Your account information</p>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card overflow-hidden"
        >
          <div className="p-10 text-center border-b border-surface-border">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-bold text-4xl mx-auto mb-4">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <h2 className="text-2xl font-bold text-primary">{user?.name}</h2>
            <p className="text-base text-secondary capitalize mt-1">{user?.role}</p>
          </div>
          <div className="p-8 space-y-5">
            {details.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.label} className="flex items-center gap-4 p-4 rounded-xl bg-surface-hover">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Icon size={20} className="text-accent-light" />
                  </div>
                  <div>
                    <p className="text-sm text-secondary">{d.label}</p>
                    <p className="text-base font-semibold text-primary capitalize">{d.value}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
