import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import EmissionsChart from '../components/EmissionsChart'
import Heatmap from '../components/Heatmap'
import { FileText, TrendingUp, Thermometer, Clock } from 'lucide-react'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex items-center gap-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-surface-500">{label}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
        </div>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-6 space-y-4">
      <div className="skeleton h-4 w-24" />
      <div className="skeleton h-8 w-16" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="card p-6 space-y-4">
      <div className="skeleton h-4 w-32" />
      <div className="skeleton h-[250px] w-full rounded-xl" />
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user?.company_id) {
      api.get(`/dashboard/summary/${user.company_id}`)
        .then((res) => setSummary(res.data))
        .catch((err) => setError(err.response?.data?.detail || 'Failed to load dashboard'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [user])

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <div className="skeleton h-8 w-48 mb-2" />
          <div className="skeleton h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <Thermometer size={28} className="text-red-400" />
        </div>
        <h2 className="text-lg font-semibold text-surface-800 mb-1">Failed to load dashboard</h2>
        <p className="text-sm text-surface-500">{error}</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
          <FileText size={28} className="text-primary-400" />
        </div>
        <h2 className="text-lg font-semibold text-surface-800 mb-1">No data yet</h2>
        <p className="text-sm text-surface-500">Upload a document to get started with your analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-header">{summary.company_name}</h1>
        <p className="text-sm text-surface-500 mt-1">
          Sustainability compliance overview
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={FileText}
          label="Documents"
          value={summary.document_count}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={TrendingUp}
          label="Compliance Score"
          value={summary.overall_compliance_score}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Thermometer}
          label="Climate Risk"
          value={summary.climate_risk_score}
          color="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Clock}
          label="Reports"
          value={summary.recent_reports.length}
          color="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Score donuts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-8 flex flex-col items-center">
          <ScoreDonut score={summary.overall_compliance_score} label="Overall Compliance" size={160} />
        </div>
        <div className="card p-8 flex flex-col items-center">
          <ScoreDonut score={summary.climate_risk_score} label="Climate Risk Score" size={160} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmissionsChart
          scope1={summary.emissions_summary.scope1}
          scope2={summary.emissions_summary.scope2}
          scope3={summary.emissions_summary.scope3}
        />
        <Heatmap data={summary.risk_heatmap} />
      </div>

      {/* Recent reports */}
      {summary.recent_reports.length > 0 && (
        <div className="card p-6">
          <h3 className="font-semibold text-surface-900 mb-4">Recent Reports</h3>
          <div className="space-y-2">
            {summary.recent_reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2.5 border-b border-surface-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                    <FileText size={14} className="text-primary-500" />
                  </div>
                  <span className="text-sm font-medium text-surface-800 capitalize">
                    {r.report_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className="text-xs text-surface-400">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
