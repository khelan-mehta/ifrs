import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import ScoreDonut from '../components/ScoreDonut'
import EmissionsChart from '../components/EmissionsChart'
import Heatmap from '../components/Heatmap'
import { FileText, TrendingUp, Thermometer, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react'

function StatCard({ icon: Icon, label, value, change, positive, color }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] text-surface-500">{label}</span>
        <div className={`w-8 h-8 rounded-md flex items-center justify-center ${color}`}>
          <Icon size={15} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-surface-900 tabular-nums">{value}</p>
      {change !== undefined && (
        <div className="flex items-center gap-1 mt-1.5">
          {positive ? (
            <ArrowUpRight size={12} className="text-emerald-500" />
          ) : (
            <ArrowDownRight size={12} className="text-red-500" />
          )}
          <span className={`text-xs font-medium ${positive ? 'text-emerald-600' : 'text-red-600'}`}>
            {change}
          </span>
        </div>
      )}
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-7 w-14" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-3 w-28" />
      <div className="skeleton h-[220px] w-full rounded-md" />
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
      <div className="space-y-6">
        <div>
          <div className="skeleton h-6 w-44 mb-1.5" />
          <div className="skeleton h-3 w-28" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mb-3">
          <Thermometer size={22} className="text-red-400" />
        </div>
        <h2 className="text-base font-semibold text-surface-800 mb-1">Failed to load dashboard</h2>
        <p className="text-sm text-surface-500">{error}</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-12 h-12 bg-surface-100 rounded-lg flex items-center justify-center mb-3">
          <FileText size={22} className="text-surface-400" />
        </div>
        <h2 className="text-base font-semibold text-surface-800 mb-1">No data yet</h2>
        <p className="text-sm text-surface-500">Upload a document to get started with your analysis.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="page-header">{summary.company_name}</h1>
        <p className="text-[13px] text-surface-500 mt-0.5">
          Sustainability compliance overview
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={FileText}
          label="Documents"
          value={summary.document_count}
          color="bg-blue-50 text-blue-600"
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-6 flex flex-col items-center">
          <ScoreDonut score={summary.overall_compliance_score} label="Overall Compliance" size={150} />
        </div>
        <div className="card p-6 flex flex-col items-center">
          <ScoreDonut score={summary.climate_risk_score} label="Climate Risk Score" size={150} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmissionsChart
          scope1={summary.emissions_summary.scope1}
          scope2={summary.emissions_summary.scope2}
          scope3={summary.emissions_summary.scope3}
        />
        <Heatmap data={summary.risk_heatmap} />
      </div>

      {/* Recent reports */}
      {summary.recent_reports.length > 0 && (
        <div className="card">
          <div className="px-5 py-4 border-b border-surface-100">
            <h3 className="text-sm font-semibold text-surface-900">Recent Reports</h3>
          </div>
          <div className="divide-y divide-surface-100">
            {summary.recent_reports.map((r) => (
              <div key={r.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-surface-100 rounded-md flex items-center justify-center">
                    <FileText size={13} className="text-surface-500" />
                  </div>
                  <span className="text-[13px] font-medium text-surface-800 capitalize">
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
