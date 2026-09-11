import React, { useEffect, useState } from 'react'
import Drawer from '../ui/Drawer'
import { Field, inputClass, selectClass, textareaClass } from '../ui/Field'
import type { Project, ProjectPriority, ProjectStatus } from '../../types'
import { db } from '../../lib/db'
import { useToast } from '../../hooks/useToast'

const statuses: ProjectStatus[] = ['Planning', 'Pending', 'In Progress', 'On Hold', 'Completed']
const priorities: ProjectPriority[] = ['Low', 'Medium', 'High', 'Urgent']

interface FormState {
  name: string
  client: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  start_date: string
  due_date: string
  assigned_to: string
  note: string
}

const empty: FormState = {
  name: '',
  client: '',
  description: '',
  status: 'Planning',
  priority: 'Medium',
  progress: 0,
  start_date: '',
  due_date: '',
  assigned_to: 'Ammar',
  note: '',
}

export default function ProjectFormDrawer({
  open,
  onClose,
  project,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  project: Project | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const isEdit = Boolean(project)

  useEffect(() => {
    if (project) {
      setForm({
        name: project.name,
        client: project.client,
        description: project.description,
        status: project.status,
        priority: project.priority,
        progress: project.progress,
        start_date: project.start_date ?? '',
        due_date: project.due_date ?? '',
        assigned_to: project.assigned_to,
        note: '',
      })
    } else {
      setForm(empty)
    }
  }, [project, open])

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      showToast('Project name is required', 'error')
      return
    }
    setSaving(true)
    try {
      if (isEdit && project) {
        await db.updateProject(project.id, {
          name: form.name,
          client: form.client,
          description: form.description,
          status: form.status,
          priority: form.priority,
          progress: form.progress,
          start_date: form.start_date || null,
          due_date: form.due_date || null,
          assigned_to: form.assigned_to,
        })
        if (form.note.trim()) await db.addProjectNote(project.id, form.note.trim())
        showToast('Project updated successfully')
      } else {
        const created = await db.createProject({
          name: form.name,
          client: form.client || 'Internal',
          description: form.description,
          status: form.status,
          priority: form.priority,
          progress: form.progress,
          start_date: form.start_date || null,
          due_date: form.due_date || null,
          assigned_to: form.assigned_to || 'Ammar',
        })
        if (form.note.trim()) await db.addProjectNote(created.id, form.note.trim())
        showToast('Project created successfully')
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
      title={isEdit ? 'Edit project' : 'Create new project'}
      subtitle={isEdit ? 'Update details for this project.' : 'Add a new project to the workspace.'}
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
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
          </button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Project name">
          <input className={inputClass} value={form.name} onChange={(e) => update({ name: e.target.value })} placeholder="e.g. Campus Connect" />
        </Field>
        <Field label="Client">
          <input className={inputClass} value={form.client} onChange={(e) => update({ client: e.target.value })} placeholder="e.g. Internal, or client name" />
        </Field>
        <Field label="Description">
          <textarea className={textareaClass} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="What is this project about?" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select className={selectClass} value={form.status} onChange={(e) => update({ status: e.target.value as ProjectStatus })}>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Priority">
            <select className={selectClass} value={form.priority} onChange={(e) => update({ priority: e.target.value as ProjectPriority })}>
              {priorities.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label={`Progress — ${form.progress}%`}>
          <input
            type="range"
            min={0}
            max={100}
            value={form.progress}
            onChange={(e) => update({ progress: Number(e.target.value) })}
            className="w-full accent-violet-500"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Start date">
            <input type="date" className={inputClass} value={form.start_date} onChange={(e) => update({ start_date: e.target.value })} />
          </Field>
          <Field label="Due date">
            <input type="date" className={inputClass} value={form.due_date} onChange={(e) => update({ due_date: e.target.value })} />
          </Field>
        </div>

        <Field label="Assigned to">
          <input className={inputClass} value={form.assigned_to} onChange={(e) => update({ assigned_to: e.target.value })} placeholder="e.g. Ammar" />
        </Field>

        <Field label="Notes" hint="Optional — appended as a new note.">
          <textarea className={textareaClass} value={form.note} onChange={(e) => update({ note: e.target.value })} placeholder="Add a note about this project…" />
        </Field>
      </div>
    </Drawer>
  )
}
