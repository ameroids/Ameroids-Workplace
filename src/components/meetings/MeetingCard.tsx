import React from 'react'
import { Clock, Users, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import type { Meeting } from '../../types'
import { MeetingStatusBadge } from '../ui/Badge'
import { formatDate } from '../../lib/format'

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])
  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button onClick={() => setOpen((o) => !o)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-100 hover:bg-base-700 transition-colors focus-ring">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 card p-1 z-20 animate-scale-in origin-top-right">
          <button onClick={() => { onEdit(); setOpen(false) }} className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-ink-300 hover:bg-base-700 rounded-md transition-colors">
            <Pencil size={13} /> Edit
          </button>
          <button onClick={() => { onDelete(); setOpen(false) }} className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function MeetingCard({
  meeting,
  featured = false,
  onOpen,
  onEdit,
  onDelete,
}: {
  meeting: Meeting
  featured?: boolean
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      onClick={onOpen}
      className={`card p-4 flex flex-col gap-3 cursor-pointer transition-all hover:-translate-y-0.5 ${
        featured ? 'border-violet-500/40 shadow-glow' : 'hover:border-base-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-sm font-medium text-ink-100">{meeting.title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mt-1">
            <Clock size={12} />
            {formatDate(meeting.date)} · {meeting.time}
          </div>
        </div>
        <RowMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-ink-400">
        <Users size={12} className="shrink-0" />
        <span className="truncate">{meeting.participants.join(', ') || 'No participants added'}</span>
      </div>

      {meeting.notes && <p className="text-xs text-ink-500 line-clamp-2">{meeting.notes}</p>}

      <div>
        <MeetingStatusBadge status={meeting.status} />
      </div>
    </div>
  )
}
