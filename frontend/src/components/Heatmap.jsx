const severityColors = ['#dcfce7', '#bbf7d0', '#fef08a', '#fdba74', '#fca5a5']

export default function Heatmap({ data }) {
  if (!data?.severity_matrix?.length) {
    return <div className="text-sm text-gray-500">No heatmap data available.</div>
  }

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-medium text-gray-900 mb-4">Risk Severity Matrix</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 px-3">Risk</th>
              <th className="text-center py-2 px-3">Likelihood</th>
              <th className="text-center py-2 px-3">Impact</th>
              <th className="text-center py-2 px-3">Severity</th>
            </tr>
          </thead>
          <tbody>
            {data.severity_matrix.map((item, i) => {
              const severity = Math.round((item.likelihood + item.impact) / 2) - 1
              const bgColor = severityColors[Math.min(severity, 4)]
              return (
                <tr key={i} className="border-b">
                  <td className="py-2 px-3">{item.risk}</td>
                  <td className="text-center py-2 px-3">{item.likelihood}/5</td>
                  <td className="text-center py-2 px-3">{item.impact}/5</td>
                  <td className="text-center py-2 px-3">
                    <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: bgColor }}>
                      {severity + 1}/5
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
