import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 text-white text-xs px-3 py-2 rounded-md shadow-elevated">
        <p className="font-medium">{payload[0].payload.name}</p>
        <p className="text-surface-300 mt-0.5">
          {payload[0].value?.toLocaleString()} tCO2e
        </p>
      </div>
    )
  }
  return null
}

export default function EmissionsChart({ scope1 = 0, scope2 = 0, scope3 = 0 }) {
  const data = [
    { name: 'Scope 1', value: scope1, fill: '#4361ee' },
    { name: 'Scope 2', value: scope2, fill: '#7c3aed' },
    { name: 'Scope 3', value: scope3, fill: '#a78bfa' },
  ]

  return (
    <div className="card">
      <div className="flex items-center justify-between px-5 py-4 border-b border-surface-100">
        <div>
          <h3 className="text-sm font-semibold text-surface-900">GHG Emissions</h3>
          <p className="text-[11px] text-surface-400 mt-0.5">
            By scope (tCO2e)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: d.fill }}
              />
              <span className="text-[11px] text-surface-500">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="p-5">
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f3f4f6' }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
