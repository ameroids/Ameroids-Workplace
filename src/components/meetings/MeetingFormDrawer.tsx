import React, { useEffect, useState } from 'react'
import Drawer from '../ui/Drawer'
import { Field, inputClass, selectClass, textareaClass } from '../ui/Field'
import type { Meeting, MeetingStatus } from '../../types'
import { db } from '../../lib/db'
import { useToast } from '../../hooks/useToast'

const statuses: MeetingStatus[] = ['Upcoming', 'Completed', 'Cancelled']

interface FormState {
  title: string
  date: string
  time: string
  participants: string
  agenda: string
  notes: string
  action_items: string
  status: MeetingStatus
}

const today = () => new Date().toISOString().slice(0, 10)

const empty: FormState = { title: '', date: today(), time: '10:00', participants: '', agenda: '', notes: '', action_items: '', status: 'Upcoming' }

export default function MeetingFormDrawer({
  open,
  onClose,
  meeting,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  meeting: Meeting | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const isEdit = Boolean(meeting)

  useEffect(() => {
    if (meeting) {
      setForm({
        title: meeting.title,
        date: meeting.date,
        time: meeting.time,
        participants: meeting.participants.join(', '),
        agenda: meeting.agenda,
        notes: meeting.notes,
        action_items: meeting.action_items,
        status: meeting.status,
      })
    } else {
      setForm(empty)
    }
  }, [meeting, open])

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      showToast('Meeting title is required', 'error')
      return
    }
    setSaving(true)
    const participants = form.participants.split(',').map((p) => p.trim()).filter(Boolean)
    try {
      if (isEdit && meeting) {
        await db.updateMeeting(meeting.id, {
          title: form.title,
          date: form.date,
          time: form.time,
          participants,
          agenda: form.agenda,
          notes: form.notes,
          action_items: form.action_items,
          status: form.status,
        })
        showToast('Meeting updated')
      } else {
        await db.createMeeting({
          title: form.title,
          date: form.date,
          time: form.time,
          participants,
          agenda: form.agenda,
          notes: form.notes,
          decisions: '',
          action_items: form.action_items,
          status: form.status,
        })
        showToast('Meeting created')
      }
      onSaved()
      onClose()
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
      title={isEdit ? 'Edit meeting' : 'New meeting'}
      subtitle={isEdit ? 'Update this meeting.' : 'Schedule a new meeting.'}
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-ink-300 hover:bg-base-700 transition-colors focus-ring">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 focus-ring"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create meeting'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Title">
          <input className={inputClass} value={form.title} onChange={(e) => update({ title: e.target.value })} placeholder="e.g. Ameroids Weekly Sync" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Date">
            <input type="date" className={inputClass} value={form.date} onChange={(e) => update({ date: e.target.value })} />
          </Field>
          <Field label="Time">
            <input type="time" className={inputClass} value={form.time} onChange={(e) => update({ time: e.target.value })} />
          </Field>
        </div>

        <Field label="Participants" hint="Comma-separated">
          <input className={inputClass} value={form.participants} onChange={(e) => update({ participants: e.target.value })} placeholder="Ammar, Client name" />
        </Field>

        <Field label="Status">
          <select className={selectClass} value={form.status} onChange={(e) => update({ status: e.target.value as MeetingStatus })}>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        <Field label="Agenda">
          <textarea className={textareaClass} value={form.agenda} onChange={(e) => update({ agenda: e.target.value })} placeholder="What will be discussed?" />
        </Field>

        <Field label="Notes" hint="Optional">
          <textarea className={textareaClass} value={form.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Notes so far…" />
        </Field>

        <Field label="Action items" hint="Optional">
          <textarea className={textareaClass} value={form.action_items} onChange={(e) => update({ action_items: e.target.value })} placeholder="What needs to be done afterward?" />
        </Field>
      </div>
    </Drawer>
  )
}
