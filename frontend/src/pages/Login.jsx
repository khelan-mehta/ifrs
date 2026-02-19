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
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-surface-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 via-transparent to-primary-800/10" />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">IFRS Suite</span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              AI-Powered Sustainability Compliance
            </h2>
            <p className="text-surface-400 text-lg leading-relaxed">
              Automate IFRS S1/S2 analysis, climate risk scoring, and sustainability report generation with enterprise-grade AI.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[
                { label: 'IFRS S1 & S2', desc: 'Full compliance scoring' },
                { label: 'Climate Risk', desc: 'Physical & transition' },
                { label: 'AI Reports', desc: 'Auto-generated drafts' },
                { label: 'RAG Pipeline', desc: 'Document intelligence' },
              ].map((item) => (
                <div key={item.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <p className="text-sm font-semibold text-white">{item.label}</p>
                  <p className="text-xs text-surface-400 mt-0.5">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-surface-500 text-sm">v1.0.0</p>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-surface-900 tracking-tight">IFRS Suite</span>
          </div>

          <div>
            <h1 className="text-2xl font-bold text-surface-900 tracking-tight">Welcome back</h1>
            <p className="text-surface-500 mt-1">Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="mt-6 flex items-start gap-3 bg-red-50 text-red-700 text-sm rounded-xl p-4 ring-1 ring-red-100 animate-slide-up">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
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
              <label className="block text-sm font-medium text-surface-700 mb-1.5">
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
              className="btn-primary w-full flex items-center justify-center gap-2 py-3"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
