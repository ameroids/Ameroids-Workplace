import React, { useEffect, useState } from 'react'
import { Users, CalendarClock, ListChecks, FileText, Gavel } from 'lucide-react'
import type { Meeting } from '../../types'
import Drawer from '../ui/Drawer'
import { MeetingStatusBadge } from '../ui/Badge'
import { formatDate } from '../../lib/format'
import { db } from '../../lib/db'
import { useToast } from '../../hooks/useToast'
import { textareaClass } from '../ui/Field'

export default function MeetingDrawer({
  meeting,
  open,
  onClose,
  onEdit,
  onChanged,
}: {
  meeting: Meeting | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onChanged: () => void
}) {
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()

  useEffect(() => setNotes(meeting?.notes ?? ''), [meeting])

  if (!meeting) return null

  const saveNotes = async () => {
    setSaving(true)
    try {
      await db.updateMeeting(meeting.id, { notes })
      onChanged()
      showToast('Meeting notes saved')
    } catch {
      showToast('Unable to save changes', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={meeting.title}
      subtitle={`${formatDate(meeting.date)} · ${meeting.time}`}
      width="lg"
      footer={
        <button onClick={onEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors focus-ring">
          Edit meeting
        </button>
      }
    >
      <div className="mb-5">
        <MeetingStatusBadge status={meeting.status} />
      </div>

      <div className="card p-3.5 mb-5">
        <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1.5">
          <Users size={12} /> Participants
        </div>
        <div className="text-sm text-ink-200">{meeting.participants.join(', ') || 'No participants added'}</div>
      </div>

      <Section icon={CalendarClock} title="Agenda" text={meeting.agenda} />

      <div className="mb-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-ink-400 mb-2">
          <FileText size={12} /> Notes
        </div>
        <textarea
          className={textareaClass + ' min-h-[100px]'}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes from this meeting…"
        />
        <button
          onClick={saveNotes}
          disabled={saving || notes === meeting.notes}
          className="mt-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-base-800 border border-base-600 text-ink-300 hover:text-ink-100 hover:border-base-500 transition-colors disabled:opacity-40 focus-ring"
        >
          {saving ? 'Saving…' : 'Save notes'}
        </button>
      </div>

      <Section icon={Gavel} title="Decisions" text={meeting.decisions} />
      <Section icon={ListChecks} title="Action items" text={meeting.action_items} last />
    </Drawer>
  )
}

function Section({ icon: Icon, title, text, last = false }: { icon: React.ElementType; title: string; text: string; last?: boolean }) {
  return (
    <div className={last ? '' : 'mb-5'}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-ink-400 mb-2">
        <Icon size={12} /> {title}
      </div>
      <p className="text-sm text-ink-300 leading-relaxed whitespace-pre-line">{text || `No ${title.toLowerCase()} recorded yet.`}</p>
    </div>
  )
}
