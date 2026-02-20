const severityConfig = [
  { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Low' },
  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Low-Med' },
  { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Medium' },
  { bg: 'bg-orange-100', text: 'text-orange-700', label: 'High' },
  { bg: 'bg-red-100', text: 'text-red-700', label: 'Critical' },
]

export default function Heatmap({ data }) {
  if (!data?.severity_matrix?.length) {
    return (
      <div className="card">
        <div className="px-5 py-4 border-b border-surface-100">
          <h3 className="text-sm font-semibold text-surface-900">Risk Severity Matrix</h3>
        </div>
        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-surface-400">No heatmap data available yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="px-5 py-4 border-b border-surface-100">
        <h3 className="text-sm font-semibold text-surface-900">Risk Severity Matrix</h3>
        <p className="text-[11px] text-surface-400 mt-0.5">
          Likelihood vs. impact assessment
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-surface-100">
              <th className="text-left py-2.5 px-5 text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                Risk Factor
              </th>
              <th className="text-center py-2.5 px-4 text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                Likelihood
              </th>
              <th className="text-center py-2.5 px-4 text-[11px] font-medium text-surface-500 uppercase tracking-wider">
                Impact
              </th>
              <th className="text-center py-2.5 px-4 text-[11px] font-medium text-surface-500 uppercase tracking-wider">
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
                  className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50 transition-colors"
                >
                  <td className="py-2.5 px-5 text-[13px] font-medium text-surface-800">
                    {item.risk}
                  </td>
                  <td className="text-center py-2.5 px-4">
                    <span className="text-[13px] text-surface-600">{item.likelihood}</span>
                    <span className="text-surface-300">/5</span>
                  </td>
                  <td className="text-center py-2.5 px-4">
                    <span className="text-[13px] text-surface-600">{item.impact}</span>
                    <span className="text-surface-300">/5</span>
                  </td>
                  <td className="text-center py-2.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${config.bg} ${config.text}`}
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
