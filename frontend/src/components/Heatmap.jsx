const severityConfig = [
  { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Low' },
  { bg: 'bg-emerald-200', text: 'text-emerald-800', label: 'Low-Med' },
  { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Medium' },
  { bg: 'bg-orange-200', text: 'text-orange-800', label: 'High' },
  { bg: 'bg-red-200', text: 'text-red-800', label: 'Critical' },
]

export default function Heatmap({ data }) {
  if (!data?.severity_matrix?.length) {
    return (
      <div className="card p-6">
        <h3 className="font-semibold text-surface-900 mb-2">Risk Severity Matrix</h3>
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-surface-400">No heatmap data available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card p-6 animate-slide-up">
      <div className="mb-5">
        <h3 className="font-semibold text-surface-900">Risk Severity Matrix</h3>
        <p className="text-xs text-surface-400 mt-0.5">
          Likelihood vs. impact assessment
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Risk Factor
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Likelihood
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Impact
              </th>
              <th className="text-center py-3 px-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">
                Severity
              </th>
            </tr>
          </thead>
          <tbody>
            {data.severity_matrix.map((item, i) => {
              const severity = Math.round((item.likelihood + item.impact) / 2) - 1
              const config = severityConfig[Math.min(Math.max(severity, 0), 4)]
              return (
                <tr
                  key={i}
                  className="border-b border-surface-50 hover:bg-surface-50/50 transition-colors"
                >
                  <td className="py-3 px-4 font-medium text-surface-800">
                    {item.risk}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-surface-600">{item.likelihood}</span>
                    <span className="text-surface-300">/5</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-surface-600">{item.impact}</span>
                    <span className="text-surface-300">/5</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                    >
                      {config.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
