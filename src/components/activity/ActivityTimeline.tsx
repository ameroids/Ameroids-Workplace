import React from 'react'
import { FolderPlus, RefreshCcw, TrendingUp, MessageSquare, Wallet, CalendarPlus, CalendarCheck } from 'lucide-react'
import type { ActivityLog, ActivityKind } from '../../types'
import { formatDateTime, timeAgo } from '../../lib/format'

const iconFor: Record<ActivityKind, React.ElementType> = {
  project_created: FolderPlus,
  project_status: RefreshCcw,
  project_progress: TrendingUp,
  project_update: MessageSquare,
  transaction: Wallet,
  meeting_created: CalendarPlus,
  meeting_updated: CalendarCheck,
}

const colorFor: Record<ActivityKind, string> = {
  project_created: 'text-sky-400 bg-sky-500/10',
  project_status: 'text-emerald-400 bg-emerald-500/10',
  project_progress: 'text-violet-400 bg-violet-500/10',
  project_update: 'text-ink-300 bg-base-700/60',
  transaction: 'text-amber-400 bg-amber-500/10',
  meeting_created: 'text-violet-400 bg-violet-500/10',
  meeting_updated: 'text-violet-400 bg-violet-500/10',
}

export default function ActivityTimeline({ activity, compact = false }: { activity: ActivityLog[]; compact?: boolean }) {
  return (
    <div className="relative pl-6">
      <div className="absolute left-[11px] top-2 bottom-2 w-px bg-base-700" />
      <div className={compact ? 'flex flex-col gap-4' : 'flex flex-col gap-5'}>
        {activity.map((a) => {
          const Icon = iconFor[a.kind]
          return (
            <div key={a.id} className="relative">
              <div className="absolute -left-6 top-0 w-6 h-6 rounded-full ring-4 ring-base-950 bg-base-950">
                <div className={`w-full h-full rounded-full flex items-center justify-center ${colorFor[a.kind]}`}>
                  <Icon size={12} />
                </div>
              </div>
              <p className="text-sm text-ink-200 leading-snug">{a.description}</p>
              <p className="text-xs text-ink-500 mt-0.5" title={formatDateTime(a.created_at)}>
                {timeAgo(a.created_at)}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
