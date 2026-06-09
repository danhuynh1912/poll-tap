import { cx } from '../../lib/utils'

export function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  const full = value >= max && max > 0
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-500">Slots filled</span>
        <span className="text-sm font-bold text-slate-900">
          {value}<span className="text-slate-400 font-medium"> / {max}</span>
        </span>
      </div>
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={cx(
            'absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out',
            full ? 'bg-slate-900' : 'bg-lime-400'
          )}
          style={{ width: `${pct}%` }}
        >
          <div className="absolute inset-0 -skew-x-12 bg-white/30 animate-shimmer" />
        </div>
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>{pct}% capacity</span>
        <span>{full ? 'Full' : `${Math.max(0, max - value)} open`}</span>
      </div>
    </div>
  )
}
