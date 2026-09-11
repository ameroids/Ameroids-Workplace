import React, { useState } from 'react'
import { Send, StickyNote, User, CalendarRange, Flag } from 'lucide-react'
import type { Project } from '../../types'
import Drawer from '../ui/Drawer'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import { formatDate, formatDateTime, timeAgo } from '../../lib/format'
import { db } from '../../lib/db'
import { useToast } from '../../hooks/useToast'

export default function ProjectDrawer({
  project,
  open,
  onClose,
  onEdit,
  onChanged,
}: {
  project: Project | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onChanged: () => void
}) {
  const [updateText, setUpdateText] = useState('')
  const [noteText, setNoteText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()

  if (!project) return null

  const submitUpdate = async () => {
    if (!updateText.trim()) return
    setSubmitting(true)
    try {
      await db.addProjectUpdate(project.id, updateText.trim())
      setUpdateText('')
      onChanged()
      showToast('Update added')
    } catch {
      showToast('Unable to save update', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const submitNote = async () => {
    if (!noteText.trim()) return
    setSubmitting(true)
    try {
      await db.addProjectNote(project.id, noteText.trim())
      setNoteText('')
      onChanged()
      showToast('Note added')
    } catch {
      showToast('Unable to save note', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={project.name}
      subtitle={project.client}
      width="lg"
      footer={
        <button onClick={onEdit} className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors focus-ring">
          Edit project
        </button>
      }
    >
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <StatusBadge status={project.status} />
        <PriorityBadge priority={project.priority} />
      </div>

      <p className="text-sm text-ink-300 leading-relaxed mb-6">{project.description || 'No description provided yet.'}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1.5">
            <CalendarRange size={12} /> Start date
          </div>
          <div className="text-sm text-ink-200">{formatDate(project.start_date)}</div>
        </div>
        <div className="card p-3.5">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1.5">
            <Flag size={12} /> Deadline
          </div>
          <div className="text-sm text-ink-200">{formatDate(project.due_date)}</div>
        </div>
        <div className="card p-3.5 col-span-2">
          <div className="flex items-center gap-1.5 text-xs text-ink-500 mb-1.5">
            <User size={12} /> Assigned to
          </div>
          <div className="text-sm text-ink-200">{project.assigned_to || 'Unassigned'}</div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-ink-400">Progress</span>
          <span className="text-xs text-ink-400 tabular">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      {project.notes.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-medium text-ink-400 mb-2 flex items-center gap-1.5">
            <StickyNote size={12} /> Notes
          </div>
          <div className="flex flex-col gap-2">
            {project.notes.map((n) => (
              <div key={n.id} className="card p-3 text-sm text-ink-300">
                {n.text}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-3">
        <div className="flex gap-2 mb-4">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note…"
            onKeyDown={(e) => e.key === 'Enter' && submitNote()}
            className="flex-1 bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus-ring focus:border-violet-500/60"
          />
          <button
            onClick={submitNote}
            disabled={submitting || !noteText.trim()}
            className="px-3 rounded-lg bg-base-800 border border-base-600 text-ink-300 hover:text-ink-100 hover:border-base-500 transition-colors disabled:opacity-40 focus-ring"
          >
            Save
          </button>
        </div>
      </div>

      <div>
        <div className="text-xs font-medium text-ink-400 mb-3">Activity timeline</div>
        <div className="flex gap-2 mb-4">
          <input
            value={updateText}
            onChange={(e) => setUpdateText(e.target.value)}
            placeholder="Post an update, e.g. “Homepage completed.”"
            onKeyDown={(e) => e.key === 'Enter' && submitUpdate()}
            className="flex-1 bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus-ring focus:border-violet-500/60"
          />
          <button
            onClick={submitUpdate}
            disabled={submitting || !updateText.trim()}
            className="w-10 h-10 shrink-0 rounded-lg bg-violet-600 hover:bg-violet-500 text-white flex items-center justify-center transition-colors disabled:opacity-40 focus-ring"
          >
            <Send size={14} />
          </button>
        </div>

        <div className="relative pl-5">
          <div className="absolute left-[7px] top-1 bottom-1 w-px bg-base-700" />
          <div className="flex flex-col gap-5">
            {project.updates.length === 0 && <p className="text-sm text-ink-500">No updates yet. Post the first one above.</p>}
            {project.updates.map((u) => (
              <div key={u.id} className="relative">
                <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-violet-500 ring-4 ring-base-900" />
                <p className="text-sm text-ink-200 leading-relaxed">{u.text}</p>
                <p className="text-xs text-ink-500 mt-1">
                  {u.author} · {formatDateTime(u.created_at)} · {timeAgo(u.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Drawer>
  )
}
