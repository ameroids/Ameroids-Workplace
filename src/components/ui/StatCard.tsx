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
    <div className="card p-6 flex flex-col gap-4 bg-base-900/40 backdrop-blur-sm border-base-700/50 hover:border-base-600/80 transition-all duration-300">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider font-medium text-ink-500">{label}</span>
        <Icon size={16} strokeWidth={1.5} className="text-ink-500/70" />
      </div>
      <div>
        <div className={`text-4xl font-light tracking-tight tabular ${toneText[tone]}`}>{value}</div>
        {hint && <div className="text-xs text-ink-500 mt-2 font-light">{hint}</div>}
      </div>
    </div>
  )
}
