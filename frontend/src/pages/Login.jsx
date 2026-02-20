import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Shield, ArrowRight, AlertCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900/30 via-transparent to-surface-900" />
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-base font-semibold text-white tracking-tight">IFRS Suite</span>
          </div>

          <div className="max-w-sm">
            <h2 className="text-3xl font-semibold text-white leading-tight mb-3">
              Sustainability Compliance Platform
            </h2>
            <p className="text-surface-400 leading-relaxed">
              Automate IFRS S1/S2 analysis, climate risk scoring, and sustainability report generation.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {[
                { label: 'IFRS S1 & S2', desc: 'Compliance scoring' },
                { label: 'Climate Risk', desc: 'Risk assessment' },
                { label: 'AI Reports', desc: 'Auto-generated' },
                { label: 'RAG Pipeline', desc: 'Doc intelligence' },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-md p-3 border border-white/[0.06]">
                  <p className="text-[13px] font-medium text-white">{item.label}</p>
                  <p className="text-[11px] text-surface-500 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-surface-600 text-xs">v1.0.0</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-primary-600 rounded-md flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="text-base font-semibold text-surface-900 tracking-tight">IFRS Suite</span>
          </div>

          <div>
            <h1 className="text-xl font-semibold text-surface-900">Welcome back</h1>
            <p className="text-[13px] text-surface-500 mt-1">Sign in to your account</p>
          </div>

          {error && (
            <div className="mt-5 flex items-start gap-2.5 bg-red-50 text-red-700 text-[13px] rounded-lg p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-surface-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
