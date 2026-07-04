import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { authAPI } from '../../api/services'
import toast from 'react-hot-toast'
import { Zap, Lock, Eye, EyeOff, CheckCircle, Mail } from 'lucide-react'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailFromState = location.state?.email || ''
  
  const [step, setStep] = useState(1) // 1: enter code, 2: enter new password
  const [email, setEmail] = useState(emailFromState)
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [resetToken, setResetToken] = useState('')

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    
    if (code.length !== 6) {
      toast.error('Please enter a 6-digit code')
      return
    }

    setLoading(true)
    try {
      console.log('Verifying reset code:', { email, code })
      const response = await authAPI.verifyResetCode(email, code)
      console.log('Verify code response:', response)
      setResetToken(response.data.data)
      setStep(2)
      toast.success('Code verified! Enter your new password.')
    } catch (err) {
      console.error('Verify code error:', err)
      toast.error(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      console.log('Resetting password with token:', resetToken)
      await authAPI.resetPassword(resetToken, password)
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      console.error('Reset password error:', err)
      toast.error(err.response?.data?.message || 'Failed to reset password')
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
          {!success ? (
            <>
              {step === 1 ? (
                <>
                  <h2 className="text-lg font-600 text-white mb-1">Enter Reset Code</h2>
                  <p className="text-sm text-slate-400 mb-6">
                    Enter the 6-digit code sent to your email
                  </p>

                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-500 text-slate-400 mb-1.5">Email</label>
                      <div className="relative">
                        <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="email" required
                          className="input pl-9"
                          placeholder="you@company.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          disabled={emailFromState}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-500 text-slate-400 mb-1.5">Reset Code</label>
                      <input
                        type="text" required
                        className="input text-center text-2xl tracking-widest"
                        placeholder="000000"
                        value={code}
                        onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full justify-center mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : 'Verify Code'}
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <h2 className="text-lg font-600 text-white mb-1">Set New Password</h2>
                  <p className="text-sm text-slate-400 mb-6">Enter your new password</p>

                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-500 text-slate-400 mb-1.5">New Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showPassword ? 'text' : 'password'} required
                          className="input pl-9 pr-10"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          onClick={() => setShowPassword(s => !s)}
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-500 text-slate-400 mb-1.5">Confirm Password</label>
                      <div className="relative">
                        <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'} required
                          className="input pl-9 pr-10"
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          minLength={6}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                          onClick={() => setShowConfirmPassword(s => !s)}
                        >
                          {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary w-full justify-center mt-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      ) : 'Reset Password'}
                    </button>
                  </form>
                </>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <h2 className="text-lg font-600 text-white mb-2">Password Reset!</h2>
              <p className="text-sm text-slate-400 mb-4">
                Your password has been reset successfully.
              </p>
              <p className="text-xs text-slate-500">
                Redirecting to login page...
              </p>
            </div>
          )}

          {!success && (
            <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: 'var(--border)' }}>
              <Link
                to="/login"
                className="text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Back to login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
