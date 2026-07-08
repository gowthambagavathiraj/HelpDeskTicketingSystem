import { useState, useEffect } from 'react'
import { adminAPI } from '../../api/services'
import { PageHeader, Spinner } from '../../components/common/ui'
import toast from 'react-hot-toast'
import { ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

const ROLES = ['USER', 'ADMIN']

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    adminAPI.getUsers()
      .then(({ data }) => setUsers(data.data || []))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  const changeRole = async (userId, role) => {
    try {
      const { data } = await adminAPI.updateUserRole(userId, role)
      setUsers(p => p.map(u => u.id === userId ? data.data : u))
      toast.success('Role updated')
    } catch {
      toast.error('Failed to update role')
    }
  }

  const toggleActive = async (userId) => {
    try {
      const { data } = await adminAPI.toggleUserActive(userId)
      setUsers(p => p.map(u => u.id === userId ? data.data : u))
      toast.success('User status updated')
    } catch {
      toast.error('Failed to update user')
    }
  }

  const deleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return
    }
    
    try {
      await adminAPI.deleteUser(userId)
      setUsers(p => p.filter(u => u.id !== userId))
      toast.success('User deleted successfully')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
  }

  const filtered = filter
    ? users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()))
    : users

  return (
    <div className="p-6 animate-fade-in">
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered users`}
        actions={
          <input className="input w-56 text-sm" placeholder="Search users..."
            value={filter} onChange={e => setFilter(e.target.value)} />
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-2)' }}>
                {['User', 'Email', 'Department', 'Role', 'Status', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-600 uppercase tracking-wider text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-700 flex items-center justify-center text-xs font-600 text-white">
                        {u.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{u.department?.departmentName || '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      className="text-xs rounded px-2 py-1 border"
                      style={{ background: 'var(--surface-3)', borderColor: 'var(--border)', color: 'var(--text)' }}
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                    >
                      {ROLES.map(r => <option key={r} value={r}>{r.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-500 ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {u.createdAt ? format(new Date(u.createdAt), 'MMM d, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        className={`p-1.5 rounded transition-colors ${u.isActive ? 'text-green-500 hover:bg-red-500/10' : 'text-red-500 hover:bg-green-500/10'}`}
                        onClick={() => toggleActive(u.id)}
                        title={u.isActive ? 'Deactivate user' : 'Activate user'}
                      >
                        {u.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        className="p-1.5 rounded transition-colors text-red-500 hover:bg-red-500/10"
                        onClick={() => deleteUser(u.id, u.name)}
                        title="Delete user"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
