import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = {
  high: '#059669',
  medium: '#d97706',
  low: '#dc2626',
}

export default function ScoreDonut({ score, label, size = 120 }) {
  const numScore = Number(score) || 0
  const color =
    numScore >= 70 ? COLORS.high : numScore >= 40 ? COLORS.medium : COLORS.low
  const data = [{ value: numScore }, { value: 100 - numScore }]

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius="75%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#f3f4f6" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold text-surface-900 tabular-nums">{numScore}</span>
          <span className="text-[10px] text-surface-400">/ 100</span>
        </div>
      </div>
      {label && (
        <p className="text-[13px] text-surface-500 mt-2">{label}</p>
      )}
    </div>
  )
}
