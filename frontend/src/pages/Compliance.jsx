import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import ComplianceCard from '../components/ComplianceCard'
import { ArrowLeft, Play, RefreshCw, AlertTriangle } from 'lucide-react'

export default function Compliance() {
  const { documentId } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/analysis/${documentId}`)
      .then((res) => setAnalysis(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [documentId])

  const runAnalysis = async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await api.post(`/analysis/run/${documentId}`)
      setAnalysis(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/upload" className="inline-flex items-center gap-1.5 text-[13px] text-surface-500 hover:text-surface-700 mb-2 transition-colors">
            <ArrowLeft size={13} />
            Back to Documents
          </Link>
          <h1 className="page-header">Compliance Analysis</h1>
          <p className="text-[13px] text-surface-500 mt-0.5">IFRS S1/S2 compliance scoring and gap analysis</p>
        </div>
        <button
          onClick={runAnalysis}
          disabled={running}
          className="btn-primary flex items-center gap-2"
        >
          {running ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              {analysis ? <RefreshCw size={15} /> : <Play size={15} />}
              {analysis ? 'Re-run' : 'Run Analysis'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-[13px] rounded-lg p-3">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 flex flex-col items-center space-y-3">
              <div className="skeleton w-[110px] h-[110px] rounded-full" />
              <div className="skeleton h-3 w-16" />
            </div>
          ))}
        </div>
      ) : analysis ? (
        <>
          {/* Score donuts */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={analysis.s1_score} label="IFRS S1" />
            </div>
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={analysis.s2_score} label="IFRS S2" />
            </div>
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={analysis.governance_score} label="Governance" />
            </div>
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={analysis.strategy_score} label="Strategy" />
            </div>
          </div>

          {/* Detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ComplianceCard title="Risk Management" score={analysis.risk_score} />
            <ComplianceCard title="Metrics & Targets" score={analysis.metrics_score} />
          </div>

          {/* Gap summary */}
          <div className="card">
            <div className="px-5 py-4 border-b border-surface-100">
              <h3 className="text-sm font-semibold text-surface-900">Gap Analysis Summary</h3>
              <p className="text-[11px] text-surface-400 mt-0.5">AI-identified compliance gaps and recommendations</p>
            </div>
            <div className="p-5">
              <div className="bg-surface-50 rounded-md p-4">
                <p className="text-[13px] text-surface-700 whitespace-pre-wrap leading-relaxed">
                  {analysis.gap_summary}
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-surface-100 rounded-lg flex items-center justify-center mb-3">
            <Play size={22} className="text-surface-400" />
          </div>
          <h2 className="text-base font-semibold text-surface-800 mb-1">Ready to analyze</h2>
          <p className="text-[13px] text-surface-500 text-center max-w-sm">
            Click "Run Analysis" to start IFRS S1/S2 compliance scoring for this document.
          </p>
        </div>
      )}
    </div>
  )
}
