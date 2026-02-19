import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = { high: '#22c55e', medium: '#f59e0b', low: '#ef4444' }

export default function ScoreDonut({ score, label, size = 120 }) {
  const color = score >= 70 ? COLORS.high : score >= 40 ? COLORS.medium : COLORS.low
  const data = [
    { value: score },
    { value: 100 - score },
  ]

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} dataKey="value">
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold">{score}</span>
        </div>
      </div>
      {label && <p className="text-sm text-gray-600 mt-2">{label}</p>}
    </div>
  )
}
