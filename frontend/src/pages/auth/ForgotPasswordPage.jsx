import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../../api/services'
import toast from 'react-hot-toast'
import { Zap, Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      console.log('Sending forgot password request for:', email)
      const response = await authAPI.forgotPassword(email)
      console.log('Forgot password response:', response)
      toast.success('Reset code sent! Check your email.')
      // Navigate to reset password page with email
      navigate('/reset-password', { state: { email } })
    } catch (err) {
      console.error('Forgot password error:', err)
      toast.error(err.response?.data?.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-700 text-white tracking-tight">QueryQuest</h1>
            <p className="text-xs text-slate-500">Helpdesk Ticketing System</p>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-600 text-white mb-1">Forgot Password</h2>
          <p className="text-sm text-slate-400 mb-6">
            Enter your email address and we'll send you a 6-digit reset code
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-500 text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email" required
                  className="input pl-9"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full justify-center mt-2"
              disabled={loading}
            >
              {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : 'Send Reset Code'}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
