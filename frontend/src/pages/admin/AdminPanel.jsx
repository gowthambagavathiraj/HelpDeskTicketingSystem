import { useState, useEffect } from 'react'
import { departmentAPI } from '../../api/services'
import { PageHeader, Spinner } from '../../components/common/ui'
import toast from 'react-hot-toast'
import { PlusCircle, Trash2, Building } from 'lucide-react'

export default function AdminPanel() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [newDept, setNewDept] = useState('')
  const [creating, setCreating] = useState(false)

  const load = () => {
    departmentAPI.list()
      .then(({ data }) => setDepartments(data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const create = async (e) => {
    e.preventDefault()
    if (!newDept.trim()) return
    setCreating(true)
    try {
      await departmentAPI.create(newDept.trim())
      toast.success('Department created')
      setNewDept('')
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create department')
    } finally {
      setCreating(false)
    }
  }

  const deleteDept = async (id, name) => {
    // eslint-disable-next-line no-restricted-globals
    if (!confirm(`Delete department "${name}"?`)) return
    try {
      await departmentAPI.delete(id)
      toast.success('Department deleted')
      setDepartments(p => p.filter(d => d.id !== id))
    } catch {
      toast.error('Failed to delete department')
    }
  }

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <PageHeader title="Admin Settings" subtitle="Manage departments and system configuration" />

      <div className="card">
        <h2 className="text-sm font-600 text-white mb-4 flex items-center gap-2">
          <Building size={16} className="text-slate-400" /> Departments
        </h2>

        {/* Create */}
        <form onSubmit={create} className="flex gap-2 mb-5">
          <input className="input flex-1" placeholder="New department name"
            value={newDept} onChange={e => setNewDept(e.target.value)} />
          <button type="submit" className="btn btn-primary" disabled={creating}>
            <PlusCircle size={14} /> {creating ? 'Adding...' : 'Add'}
          </button>
        </form>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : departments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No departments yet.</p>
        ) : (
          <div className="space-y-2">
            {departments.map(dept => (
              <div key={dept.id}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                style={{ background: 'var(--surface-3)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <span className="text-sm text-slate-200">{dept.departmentName}</span>
                </div>
                <button
                  className="p-1.5 rounded-md text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                  onClick={() => deleteDept(dept.id, dept.departmentName)}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
