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
      <div className="bg-surface-800 text-white text-xs px-3 py-2 rounded-lg shadow-elevated">
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
    { name: 'Scope 1', value: scope1, fill: '#6366f1' },
    { name: 'Scope 2', value: scope2, fill: '#8b5cf6' },
    { name: 'Scope 3', value: scope3, fill: '#a78bfa' },
  ]

  return (
    <div className="card p-6 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-semibold text-surface-900">GHG Emissions</h3>
          <p className="text-xs text-surface-400 mt-0.5">
            Greenhouse gas emissions by scope (tCO2e)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {data.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: d.fill }}
              />
              <span className="text-[11px] text-surface-500">{d.name}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 12, fill: '#64748b' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
