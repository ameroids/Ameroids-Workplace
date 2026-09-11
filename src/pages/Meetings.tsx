import React, { useEffect, useMemo, useState } from 'react'
import { Plus, CalendarClock } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useMeetings } from '../hooks/useMeetings'
import MeetingCard from '../components/meetings/MeetingCard'
import MeetingDrawer from '../components/meetings/MeetingDrawer'
import MeetingFormDrawer from '../components/meetings/MeetingFormDrawer'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'
import type { Meeting } from '../types'
import { getNextMeeting } from '../lib/calculations'
import { db } from '../lib/db'
import { useToast } from '../hooks/useToast'

export default function Meetings() {
  const { meetings, loading, refresh } = useMeetings()
  const [params, setParams] = useSearchParams()
  const [selected, setSelected] = useState<Meeting | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Meeting | null>(null)
  const [deleting, setDeleting] = useState<Meeting | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const openId = params.get('open')
    if (openId && meetings.length) {
      const found = meetings.find((m) => m.id === openId)
      if (found) setSelected(found)
    }
  }, [params, meetings])

  useEffect(() => {
    if (selected) {
      const fresh = meetings.find((m) => m.id === selected.id)
      if (fresh) setSelected(fresh)
    }
  }, [meetings]) // eslint-disable-line react-hooks/exhaustive-deps

  const nextMeeting = getNextMeeting(meetings)

  const { upcoming, past } = useMemo(() => {
    const sorted = [...meetings].sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime())
    return {
      upcoming: sorted.filter((m) => m.status === 'Upcoming').reverse(),
      past: sorted.filter((m) => m.status !== 'Upcoming'),
    }
  }, [meetings])

  const closeDrawer = () => {
    setSelected(null)
    if (params.get('open')) {
      params.delete('open')
      setParams(params, { replace: true })
    }
  }

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await db.deleteMeeting(deleting.id)
      showToast('Meeting deleted')
      refresh()
    } catch {
      showToast('Unable to delete meeting', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-100">Meetings</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {nextMeeting ? `Next up: ${nextMeeting.title}` : 'No upcoming meetings scheduled.'}
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormOpen(true) }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors focus-ring shrink-0"
        >
          <Plus size={16} /> New meeting
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="No upcoming meetings"
          description="Schedule your first meeting to keep track of agendas, notes and decisions."
          action={
            <button onClick={() => setFormOpen(true)} className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors focus-ring">
              Schedule meeting
            </button>
          }
        />
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-ink-200 mb-3">Upcoming</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {upcoming.map((m, i) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    featured={i === 0}
                    onOpen={() => setSelected(m)}
                    onEdit={() => { setEditing(m); setFormOpen(true) }}
                    onDelete={() => setDeleting(m)}
                  />
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-ink-200 mb-3">Past</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {past.map((m) => (
                  <MeetingCard
                    key={m.id}
                    meeting={m}
                    onOpen={() => setSelected(m)}
                    onEdit={() => { setEditing(m); setFormOpen(true) }}
                    onDelete={() => setDeleting(m)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <MeetingDrawer
        meeting={selected}
        open={Boolean(selected)}
        onClose={closeDrawer}
        onChanged={refresh}
        onEdit={() => { setEditing(selected); setFormOpen(true) }}
      />

      <MeetingFormDrawer open={formOpen} onClose={() => setFormOpen(false)} meeting={editing} onSaved={refresh} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete meeting"
        description={`This will permanently delete "${deleting?.title}".`}
        confirmLabel="Delete meeting"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
