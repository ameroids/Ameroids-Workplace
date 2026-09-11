import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: React.ReactNode
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 card">
      <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 mb-4">
        <Icon size={22} strokeWidth={1.75} />
      </div>
      <h3 className="text-ink-100 font-medium mb-1.5">{title}</h3>
      <p className="text-sm text-ink-500 max-w-sm mb-5">{description}</p>
      {action}
    </div>
  )
}
