import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function ComplianceCard({ title, score, description }) {
  const numScore = Number(score) || 0

  const config =
    numScore >= 70
      ? {
          accent: 'text-emerald-600',
          bg: 'bg-emerald-50',
          icon: TrendingUp,
          label: 'Good',
        }
      : numScore >= 40
      ? {
          accent: 'text-amber-600',
          bg: 'bg-amber-50',
          icon: Minus,
          label: 'Fair',
        }
      : {
          accent: 'text-red-600',
          bg: 'bg-red-50',
          icon: TrendingDown,
          label: 'Needs Work',
        }

  const Icon = config.icon

  return (
    <div className="card p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-[13px] font-medium text-surface-600">{title}</h3>
        <div className="flex items-center gap-1.5">
          <Icon size={14} className={config.accent} />
          <span className={`text-xl font-semibold ${config.accent} tabular-nums`}>{numScore}</span>
        </div>
      </div>
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${config.accent} ${config.bg}`}
      >
        {config.label}
      </span>
      {description && (
        <p className="text-xs text-surface-500 mt-2 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
