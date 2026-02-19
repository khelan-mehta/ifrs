import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function ComplianceCard({ title, score, description }) {
  const numScore = Number(score) || 0

  const config =
    numScore >= 70
      ? {
          border: 'border-emerald-200/60',
          bg: 'bg-gradient-to-br from-emerald-50 to-white',
          text: 'text-emerald-600',
          icon: TrendingUp,
          label: 'Good',
        }
      : numScore >= 40
      ? {
          border: 'border-amber-200/60',
          bg: 'bg-gradient-to-br from-amber-50 to-white',
          text: 'text-amber-600',
          icon: Minus,
          label: 'Fair',
        }
      : {
          border: 'border-red-200/60',
          bg: 'bg-gradient-to-br from-red-50 to-white',
          text: 'text-red-600',
          icon: TrendingDown,
          label: 'Needs Work',
        }

  const Icon = config.icon

  return (
    <div
      className={`rounded-2xl border ${config.border} ${config.bg} p-5 shadow-soft animate-slide-up`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-surface-800 text-sm">{title}</h3>
        <div className="flex items-center gap-1.5">
          <Icon size={14} className={config.text} />
          <span className={`text-2xl font-bold ${config.text}`}>{numScore}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${config.text} bg-white/60`}
        >
          {config.label}
        </span>
      </div>
      {description && (
        <p className="text-xs text-surface-500 mt-3 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}
