import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import ComplianceCard from '../components/ComplianceCard'

export default function Compliance() {
  const { documentId } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    api.get(`/analysis/${documentId}`)
      .then((res) => setAnalysis(res.data))
      .catch(() => {}) // Not yet analyzed
  }, [documentId])

  const runAnalysis = async () => {
    setRunning(true)
    try {
      const res = await api.post(`/analysis/run/${documentId}`)
      setAnalysis(res.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Analysis failed')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Compliance Analysis</h1>
        <button
          onClick={runAnalysis}
          disabled={running}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {running ? 'Analyzing...' : analysis ? 'Re-run Analysis' : 'Run Analysis'}
        </button>
      </div>

      {analysis ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={analysis.s1_score} label="IFRS S1" />
            </div>
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={analysis.s2_score} label="IFRS S2" />
            </div>
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={analysis.governance_score} label="Governance" />
            </div>
            <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
              <ScoreDonut score={analysis.strategy_score} label="Strategy" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComplianceCard title="Risk Management" score={analysis.risk_score} />
            <ComplianceCard title="Metrics & Targets" score={analysis.metrics_score} />
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h3 className="font-medium text-gray-900 mb-3">Gap Summary</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{analysis.gap_summary}</p>
          </div>
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>No analysis available yet. Click "Run Analysis" to begin.</p>
        </div>
      )}
    </div>
  )
}
