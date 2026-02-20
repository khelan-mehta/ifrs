import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import EmissionsChart from '../components/EmissionsChart'
import Heatmap from '../components/Heatmap'
import { ArrowLeft, Play, RefreshCw, AlertTriangle } from 'lucide-react'

export default function Climate() {
  const { documentId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get(`/climate/${documentId}`)
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [documentId])

  const runAnalysis = async () => {
    setRunning(true)
    setError(null)
    try {
      const res = await api.post(`/climate/analyze/${documentId}`)
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Climate analysis failed. Please try again.')
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
          <h1 className="page-header">Climate Risk Analysis</h1>
          <p className="text-[13px] text-surface-500 mt-0.5">IFRS S2 physical and transition risk assessment</p>
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
              {data ? <RefreshCw size={15} /> : <Play size={15} />}
              {data ? 'Re-run' : 'Run Analysis'}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-5 flex flex-col items-center space-y-3">
              <div className="skeleton w-[110px] h-[110px] rounded-full" />
              <div className="skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          {/* Risk scores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={data.physical_risk_score} label="Physical Risk" />
            </div>
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={data.transition_risk_score} label="Transition Risk" />
            </div>
            <div className="card p-5 flex flex-col items-center">
              <ScoreDonut score={data.scenario_alignment_score} label="Scenario Alignment" />
            </div>
          </div>

          {/* Emissions */}
          <EmissionsChart
            scope1={data.emissions_scope1 || 0}
            scope2={data.emissions_scope2 || 0}
            scope3={data.emissions_scope3 || 0}
          />

          {/* Heatmap */}
          <Heatmap data={data.risk_heatmap_data} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-12 h-12 bg-surface-100 rounded-lg flex items-center justify-center mb-3">
            <Play size={22} className="text-surface-400" />
          </div>
          <h2 className="text-base font-semibold text-surface-800 mb-1">Ready to analyze</h2>
          <p className="text-[13px] text-surface-500 text-center max-w-sm">
            Click "Run Analysis" to assess climate-related risks and emissions data.
          </p>
        </div>
      )}
    </div>
  )
}
