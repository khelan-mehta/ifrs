import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import EmissionsChart from '../components/EmissionsChart'
import Heatmap from '../components/Heatmap'

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.company_id) {
      api.get(`/dashboard/summary/${user.company_id}`)
        .then((res) => setSummary(res.data))
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [user])

  if (loading) return <div className="text-gray-500">Loading dashboard...</div>
  if (!summary) return <div className="text-gray-500">No data available. Upload a document to get started.</div>

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{summary.company_name}</h1>
        <p className="text-sm text-gray-500 mt-1">{summary.document_count} documents analyzed</p>
      </div>

      {/* Score cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
          <ScoreDonut score={summary.overall_compliance_score} label="Overall Compliance" />
        </div>
        <div className="bg-white rounded-xl border p-6 flex flex-col items-center">
          <ScoreDonut score={summary.climate_risk_score} label="Climate Risk Score" />
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-medium text-gray-900 mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Documents</span><span className="font-medium">{summary.document_count}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Reports</span><span className="font-medium">{summary.recent_reports.length}</span></div>
          </div>
        </div>
      </div>

      {/* Emissions & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionsChart
          scope1={summary.emissions_summary.scope1}
          scope2={summary.emissions_summary.scope2}
          scope3={summary.emissions_summary.scope3}
        />
        <Heatmap data={summary.risk_heatmap} />
      </div>
    </div>
  )
}
