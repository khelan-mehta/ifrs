export default function ComplianceCard({ title, score, description }) {
  const color = score >= 70 ? 'bg-green-50 border-green-200' : score >= 40 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
  const textColor = score >= 70 ? 'text-green-700' : score >= 40 ? 'text-yellow-700' : 'text-red-700'

  return (
    <div className={`rounded-xl border p-5 ${color}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <span className={`text-2xl font-bold ${textColor}`}>{score}</span>
      </div>
      {description && <p className="text-sm text-gray-600">{description}</p>}
    </div>
  )
}
