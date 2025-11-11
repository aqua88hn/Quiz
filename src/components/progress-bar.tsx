interface ProgressBarProps {
  current: number
  total: number
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden mr-4">
        <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-slate-400 text-sm whitespace-nowrap">
        {current}/{total}
      </span>
    </div>
  )
}
