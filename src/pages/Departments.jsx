import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { listDepartments, createDepartment, deleteDepartment } from '../services/api'
import PageTransition from '../components/PageTransition'
import ConfirmModal from '../components/ConfirmModal'
import EmptyState from '../components/EmptyState'
import { Building2, Plus, Trash2, Loader2 } from 'lucide-react'

export default function Departments() {
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const load = () => {
    setLoading(true)
    listDepartments().then(setDepts).catch(() => {}).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    try {
      await createDepartment(name.trim())
      setName('')
      load()
    } catch {}
    setCreating(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteDepartment(deleteTarget)
    setDeleteTarget(null)
    load()
  }

  return (
    <PageTransition>
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Department"
        message="Are you sure? Agents assigned to this department will keep their department reference."
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-[#FAFAFA] flex items-center gap-3">
            <Building2 size={28} className="text-accent" /> Departments
          </h1>
          <p className="text-base text-[#A1A1AA] mt-2">Manage organizational departments</p>
        </div>

        <form onSubmit={handleCreate} className="card p-6 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-[#A1A1AA] mb-2">New Department</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="input-dark" placeholder="e.g. Sales, Support, Collections" />
          </div>
          <button type="submit" disabled={creating || !name.trim()}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {creating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
            Add Department
          </button>
        </form>

        {loading ? (
          <div className="card p-8 text-center text-[#52525B]">Loading...</div>
        ) : depts.length === 0 ? (
          <EmptyState title="No departments" description="Create your first department to organize agents." />
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-base">
              <thead>
                <tr className="text-[#A1A1AA] text-left border-b border-surface-border">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Created</th>
                  <th className="p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {depts.map((d, i) => (
                  <motion.tr
                    key={d.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.03 * i }}
                    className="border-b border-surface-border hover:bg-surface-hover transition-colors"
                  >
                    <td className="p-4 font-medium text-[#D4D4D8]">{d.name}</td>
                    <td className="p-4 text-[#A1A1AA]">
                      {d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="p-4">
                      <button onClick={() => setDeleteTarget(d.id)}
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
        )}
      </div>
    </PageTransition>
  )
}
