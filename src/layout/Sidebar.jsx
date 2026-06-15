import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, UserPlus, Upload, Phone, Star,
  BarChart3, Shield, Settings, LogOut, X, Menu, Headphones, Sun, Moon
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const menuItems = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Agents', path: '/agents', icon: Users },
  { label: 'Add Agent', path: '/agents/new', icon: UserPlus },
  // { label: 'Upload Call', path: '/upload', icon: Upload },
  { label: 'Calls', path: '/calls', icon: Phone },
  { label: 'Evaluations', path: '/evaluations', icon: Star },
  { label: 'Analytics', path: '/analytics', icon: BarChart3 },
  { label: 'Users', path: '/users', icon: Shield, adminOnly: true },
  { label: 'Profile', path: '/profile', icon: Settings },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const [collapsed, setCollapsed] = useState(true)
  const [dark, setDark] = useState(() => localStorage.getItem('theme') !== 'light')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl glass text-[#A1A1AA] hover:text-[#FAFAFA] transition-colors"
      >
        {collapsed ? <Menu size={22} /> : <X size={22} />}
      </button>
      <AnimatePresence>
        {collapsed && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setCollapsed(true)}
          />
        )}
      </AnimatePresence>
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-[300px] bg-surface-sidebar border-r border-surface-border flex flex-col transition-transform duration-300 ${
        collapsed ? '-translate-x-full' : 'translate-x-0'
      } lg:translate-x-0`}>
        <div className="p-7 border-b border-surface-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-extrabold text-lg tracking-tight">
              EP
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#FAFAFA] tracking-tight">EchoPeak</h2>
              <p className="text-[10px] text-[#A1A1AA] tracking-widest uppercase font-medium">Smarter Call Quality Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            if (item.adminOnly && user?.role !== 'admin') return null
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setCollapsed(true)}
              >
                {({ isActive }) => {
                  const Icon = item.icon
                  return (
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 group ${
                      isActive
                        ? 'bg-accent/10 text-accent-light border border-accent/20'
                        : 'text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-surface-hover border border-transparent'
                    }`}>
                      <Icon size={20} className="shrink-0" />
                      <span>{item.label}</span>
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="ml-auto w-1.5 h-1.5 rounded-full bg-accent"
                        />
                      )}
                    </div>
                  )
                }}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-surface-border space-y-1.5">
          <button
            onClick={() => setDark(!dark)}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base font-medium text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-surface-hover transition-all duration-200"
          >
            {dark ? <Sun size={20} /> : <Moon size={20} />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-[#FAFAFA] truncate">{user?.name || 'User'}</p>
              <p className="text-sm text-[#A1A1AA] capitalize truncate">{user?.role || 'user'}</p>
            </div>
            <button
              onClick={logout}
              className="text-[#A1A1AA] hover:text-[#EF4444] transition-colors p-1.5"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
