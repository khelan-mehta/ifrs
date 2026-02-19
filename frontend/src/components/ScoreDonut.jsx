import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = {
  high: '#10b981',
  medium: '#f59e0b',
  low: '#ef4444',
}

export default function ScoreDonut({ score, label, size = 130 }) {
  const numScore = Number(score) || 0
  const color =
    numScore >= 70 ? COLORS.high : numScore >= 40 ? COLORS.medium : COLORS.low
  const bgColor =
    numScore >= 70 ? '#ecfdf5' : numScore >= 40 ? '#fffbeb' : '#fef2f2'
  const data = [{ value: numScore }, { value: 100 - numScore }]

  return (
    <div className="flex flex-col items-center animate-fade-in">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              innerRadius="72%"
              outerRadius="100%"
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill={bgColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-surface-900">{numScore}</span>
          <span className="text-[10px] font-medium text-surface-400">/ 100</span>
        </div>
      </div>
      {label && (
        <p className="text-sm font-medium text-surface-600 mt-3">{label}</p>
      )}
    </div>
  )
}
