import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: 'default' | 'positive' | 'warning'
}

const toneText: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'text-ink-100',
  positive: 'text-emerald-400',
  warning: 'text-amber-400',
}

export default function StatCard({ label, value, icon: Icon, hint, tone = 'default' }: StatCardProps) {
  return (
    <div className="card p-6 flex flex-col gap-4 hover:-translate-y-1.5 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.6)] group">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-medium text-ink-500">{label}</span>
        <div className="p-2 rounded-full bg-black/5 dark:bg-white/5 group-hover:scale-110 group-hover:bg-violet-500/10 group-hover:text-violet-500 transition-all duration-300">
          <Icon size={16} strokeWidth={2} className="text-ink-500/70 group-hover:text-violet-500 transition-colors" />
        </div>
      </div>
      <div>
        <div className={`text-4xl font-light tracking-tight tabular ${toneText[tone]}`}>{value}</div>
        {hint && <div className="text-xs text-ink-500 mt-2 font-light opacity-70">{hint}</div>}
      </div>
    </div>
  )
}
