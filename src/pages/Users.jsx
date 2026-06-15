import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { listUsers, createUser, deleteUser } from '../services/api'
import PageTransition from '../components/PageTransition'
import ConfirmModal from '../components/ConfirmModal'
import { TableSkeleton } from '../components/Skeleton'
import EmptyState from '../components/EmptyState'
import { Shield, Plus, Trash2, User, Calendar, X } from 'lucide-react'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('agent')
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => {
    setLoading(true)
    listUsers().then(setUsers).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    await createUser(name, email, password, role)
    setName(''); setEmail(''); setPassword(''); setRole('agent')
    setShowForm(false)
    load()
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteUser(deleteTarget)
    setDeleteTarget(null)
    load()
  }

  return (
    <PageTransition>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
              <Shield size={28} className="text-accent" /> Users
            </h1>
            <p className="text-base text-[#A1A1AA] mt-2">Manage system users and roles</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={20} /> Add User
          </button>
        </div>

        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleCreate}
            className="card p-6 space-y-5"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">New User</h3>
              <button type="button" onClick={() => setShowForm(false)} className="btn-ghost p-1.5">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)}
                className="input-dark" required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-dark" required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-dark" required />
              <select value={role} onChange={(e) => setRole(e.target.value)} className="input-dark">
                <option value="agent">Agent</option>
                <option value="qa_manager">QA Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Create User</button>
          </motion.form>
        )}

        {loading ? (
          <TableSkeleton />
        ) : users.length === 0 ? (
          <EmptyState title="No users found" description="Create your first user to get started." />
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-base">
                <thead>
                  <tr className="text-[#A1A1AA] text-left border-b border-surface-border">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Created</th>
                    <th className="p-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-surface-border hover:bg-surface-hover transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2.5 text-[var(--text-primary)]">
                          <User size={18} className="text-[#52525B]" />
                          <span className="font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-[#A1A1AA]">{u.email}</td>
                      <td className="p-4">
                        <span className={`text-sm px-3 py-1 rounded-full border font-medium ${
                          u.role === 'admin'
                            ? 'badge-red'
                            : u.role === 'qa_manager'
                              ? 'badge-yellow'
                              : 'badge-green'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-[#A1A1AA]">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(u.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <button onClick={() => setDeleteTarget(u.id)}
                          className="btn-ghost text-red-400 hover:text-red-300 flex items-center gap-1.5"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  )
}
