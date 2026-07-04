import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketAPI, departmentAPI } from '../../api/services'
import { PageHeader } from '../../components/common/ui'
import toast from 'react-hot-toast'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileText } from 'lucide-react'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const PRIORITY_DESC = {
  LOW: 'Minor issue, non-urgent',
  MEDIUM: 'Moderate impact, needs attention',
  HIGH: 'Major issue affecting work',
  CRITICAL: 'System down, immediate action needed',
}
const PRIORITY_COLORS = {
  LOW: 'border-green-500/40 bg-green-500/5',
  MEDIUM: 'border-yellow-500/40 bg-yellow-500/5',
  HIGH: 'border-red-500/40 bg-red-500/5',
  CRITICAL: 'border-red-700/60 bg-red-700/10',
}

export default function CreateTicketPage() {
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', departmentId: '' })
  const [departments, setDepartments] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    departmentAPI.list().then(({ data }) => setDepartments(data.data || []))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (files) => setFile(files[0]),
  })

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.departmentId) { toast.error('Please select a department'); return }
    setLoading(true)
    try {
      await ticketAPI.create({ ...form, departmentId: Number(form.departmentId) })
      toast.success('Ticket created successfully!')
      navigate('/tickets')
    } catch (err) {
      const errs = err.response?.data?.data
      if (errs) Object.values(errs).forEach(m => toast.error(m))
      else toast.error(err.response?.data?.message || 'Failed to create ticket')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-2xl animate-fade-in">
      <PageHeader title="Create Ticket" subtitle="Report a new issue to the support team" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <label className="block text-xs font-500 text-slate-400 mb-2">Title *</label>
          <input type="text" required className="input" placeholder="Brief description of the issue"
            value={form.title} onChange={set('title')} />

          <label className="block text-xs font-500 text-slate-400 mb-2 mt-4">Description *</label>
          <textarea required rows={5} className="input" style={{ resize: 'vertical', minHeight: '120px' }}
            placeholder="Provide detailed information about the issue..."
            value={form.description} onChange={set('description')} />
        </div>

        {/* Priority */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <label className="block text-xs font-500 text-slate-400 mb-3">Priority *</label>
          <div className="grid grid-cols-2 gap-2">
            {PRIORITIES.map(p => (
              <button
                key={p} type="button"
                onClick={() => setForm(f => ({ ...f, priority: p }))}
                className={`p-3 rounded-lg border text-left transition-all ${
                  form.priority === p
                    ? PRIORITY_COLORS[p]
                    : 'border-transparent bg-slate-800/50 hover:bg-slate-700/50'
                }`}
              >
                <p className={`text-xs font-600 uppercase tracking-wider mb-0.5 ${
                  p === 'LOW' ? 'text-green-400' : p === 'MEDIUM' ? 'text-yellow-400' :
                  p === 'HIGH' ? 'text-red-400' : 'text-red-300'
                }`}>{p}</p>
                <p className="text-xs text-slate-500">{PRIORITY_DESC[p]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Department */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <label className="block text-xs font-500 text-slate-400 mb-2">Department *</label>
          <select className="input" required value={form.departmentId} onChange={set('departmentId')}>
            <option value="">Select a department</option>
            {departments.map(d => (
              <option key={d.id} value={d.id}>{d.departmentName}</option>
            ))}
          </select>
        </div>

        {/* Attachment */}
        <div className="card" style={{ padding: '1.25rem' }}>
          <label className="block text-xs font-500 text-slate-400 mb-3">Attachment (optional)</label>
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload size={20} className="text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-400">Drop a file here, or click to browse</p>
              <p className="text-xs text-slate-600 mt-1">Max 10MB</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--surface-3)' }}>
              <FileText size={18} className="text-indigo-400" />
              <span className="flex-1 text-sm text-slate-300 truncate">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="text-slate-500 hover:text-red-400">
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : 'Submit Ticket'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/tickets')}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
