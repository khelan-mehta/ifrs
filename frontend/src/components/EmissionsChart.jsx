import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'

export default function EmissionsChart({ scope1 = 0, scope2 = 0, scope3 = 0 }) {
  const data = [
    { name: 'Scope 1', value: scope1, fill: '#3b82f6' },
    { name: 'Scope 2', value: scope2, fill: '#8b5cf6' },
    { name: 'Scope 3', value: scope3, fill: '#ec4899' },
  ]

  return (
    <div className="bg-white rounded-xl border p-5">
      <h3 className="font-medium text-gray-900 mb-4">GHG Emissions (tCO2e)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

