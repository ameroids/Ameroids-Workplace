import React from 'react'
import type { ProjectStatus, ProjectPriority, MeetingStatus, TransactionType } from '../../types'

type BadgeTone = 'violet' | 'emerald' | 'amber' | 'rose' | 'slate' | 'sky'

const toneClasses: Record<BadgeTone, string> = {
  violet: 'bg-violet-500/10 text-violet-300 border-violet-500/25',
  emerald: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  amber: 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  rose: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
  slate: 'bg-ink-500/10 text-ink-300 border-ink-500/25',
  sky: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
}

const projectStatusTone: Record<ProjectStatus, BadgeTone> = {
  Planning: 'sky',
  Pending: 'amber',
  'In Progress': 'violet',
  'On Hold': 'rose',
  Completed: 'emerald',
}

const priorityTone: Record<ProjectPriority, BadgeTone> = {
  Low: 'slate',
  Medium: 'sky',
  High: 'amber',
  Urgent: 'rose',
}

const meetingStatusTone: Record<MeetingStatus, BadgeTone> = {
  Upcoming: 'violet',
  Completed: 'emerald',
  Cancelled: 'rose',
}

const transactionTone: Record<TransactionType, BadgeTone> = {
  Received: 'emerald',
  Spent: 'rose',
  Wajebat: 'violet',
}

function Base({ tone, children }: { tone: BadgeTone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${toneClasses[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: ProjectStatus }) {
  return <Base tone={projectStatusTone[status]}>{status}</Base>
}

export function PriorityBadge({ priority }: { priority: ProjectPriority }) {
  return <Base tone={priorityTone[priority]}>{priority}</Base>
}

export function MeetingStatusBadge({ status }: { status: MeetingStatus }) {
  return <Base tone={meetingStatusTone[status]}>{status}</Base>
}

export function TransactionTypeBadge({ type }: { type: TransactionType }) {
  return <Base tone={transactionTone[type]}>{type}</Base>
}
