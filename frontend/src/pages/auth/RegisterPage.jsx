import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { authAPI, departmentAPI } from '../../api/services'
import toast from 'react-hot-toast'
import { Zap, User, Mail, Lock } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER', departmentId: '' })
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(false)
  const [registered, setRegistered] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    departmentAPI.list().then(({ data }) => setDepartments(data.data || [])).catch(() => {})
  }, [])

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = { ...form, departmentId: form.departmentId || undefined }
      await authAPI.register(payload)
      setUserEmail(form.email)
      setRegistered(true)
      toast.success('Account created successfully!')
    } catch (err) {
      const errs = err.response?.data?.data
      if (errs) Object.values(errs).forEach(msg => toast.error(msg))
      else toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    try {
      await authAPI.resendVerification(userEmail)
      toast.success('Verification email sent! Check your inbox.')
    } catch (err) {
      toast.error('Failed to resend verification email')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-700 text-white tracking-tight">SmartDesk</h1>
            <p className="text-xs text-slate-500">Create your account</p>
          </div>
        </div>

        <div className="card">
          {!registered ? (
            <>
              <h2 className="text-lg font-600 text-white mb-5">Get started</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-500 text-slate-400 mb-1.5">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="text" required className="input pl-9" placeholder="John Smith"
                  value={form.name} onChange={set('name')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-500 text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" required className="input pl-9" placeholder="you@company.com"
                  value={form.email} onChange={set('email')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-500 text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="password" required minLength={6} className="input pl-9" placeholder="Min. 6 characters"
                  value={form.password} onChange={set('password')} />
              </div>
            </div>

            <div>
              <label className="block text-xs font-500 text-slate-400 mb-1.5">Department</label>
              <select className="input" value={form.departmentId} onChange={set('departmentId')}>
                <option value="">Select department (optional)</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.departmentName}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-full justify-center mt-2" disabled={loading}>
              {loading ? <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-500">Sign in</Link>
          </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-green-500" />
              </div>
              <h2 className="text-lg font-600 text-white mb-2">Check Your Email</h2>
              <p className="text-sm text-slate-400 mb-4">
                We've sent a verification link to <span className="text-white font-500">{userEmail}</span>
              </p>
              <p className="text-xs text-slate-500 mb-6">
                Please verify your email to activate your account. The link will expire in 24 hours.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={handleResendVerification}
                  className="text-sm text-indigo-400 hover:text-indigo-300 font-500"
                >
                  Resend verification email
                </button>
                
                <div className="pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                  <Link
                    to="/login"
                    className="text-sm text-slate-400 hover:text-slate-300"
                  >
                    Back to login
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
