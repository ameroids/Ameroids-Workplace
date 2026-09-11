import React from 'react'
import { MoreHorizontal, Pencil, Trash2, Calendar } from 'lucide-react'
import type { Project } from '../../types'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import ProgressBar from '../ui/ProgressBar'
import { formatDate, timeAgo, daysUntil } from '../../lib/format'
import { useState, useRef, useEffect } from 'react'

interface ProjectTableProps {
  projects: Project[]
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
}

function RowMenu({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-100 hover:bg-base-700 transition-colors focus-ring"
      >
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 card p-1 z-20 animate-scale-in origin-top-right">
          <button
            onClick={() => {
              onEdit()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-ink-300 hover:bg-base-700 rounded-md transition-colors"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => {
              onDelete()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function DeadlineLabel({ dueDate }: { dueDate: string | null }) {
  const days = daysUntil(dueDate)
  const overdue = days !== null && days < 0
  const soon = days !== null && days >= 0 && days <= 5
  return (
    <span className={`flex items-center gap-1.5 ${overdue ? 'text-rose-400' : soon ? 'text-amber-400' : 'text-ink-300'}`}>
      <Calendar size={13} />
      {formatDate(dueDate)}
    </span>
  )
}

export default function ProjectTable({ projects, onOpen, onEdit, onDelete }: ProjectTableProps) {
  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700/80 text-left text-xs text-ink-500">
                <th className="py-3 px-4 font-medium">Project</th>
                <th className="py-3 px-4 font-medium">Client</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Progress</th>
                <th className="py-3 px-4 font-medium">Priority</th>
                <th className="py-3 px-4 font-medium">Due date</th>
                <th className="py-3 px-4 font-medium">Last updated</th>
                <th className="py-3 px-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => onOpen(p)}
                  className="border-b border-base-700/50 last:border-0 hover:bg-base-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-ink-100 group-hover:text-violet-300 transition-colors">{p.name}</div>
                  </td>
                  <td className="py-3.5 px-4 text-ink-400">{p.client}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3.5 px-4 w-40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-20">
                        <ProgressBar value={p.progress} size="sm" />
                      </div>
                      <span className="text-xs text-ink-500 tabular">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <DeadlineLabel dueDate={p.due_date} />
                  </td>
                  <td className="py-3.5 px-4 text-ink-500 text-xs">{timeAgo(p.updated_at)}</td>
                  <td className="py-3.5 px-4">
                    <RowMenu project={p} onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-3">
        {projects.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpen(p)}
            className="card p-4 flex flex-col gap-3 active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-medium text-ink-100">{p.name}</div>
                <div className="text-xs text-ink-500 mt-0.5">{p.client}</div>
              </div>
              <RowMenu project={p} onEdit={() => onEdit(p)} onDelete={() => onDelete(p)} />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={p.status} />
              <PriorityBadge priority={p.priority} />
            </div>
            <div className="flex items-center gap-2.5">
              <div className="flex-1">
                <ProgressBar value={p.progress} size="sm" />
              </div>
              <span className="text-xs text-ink-500 tabular">{p.progress}%</span>
            </div>
            <div className="flex items-center justify-between text-xs text-ink-500">
              <DeadlineLabel dueDate={p.due_date} />
              <span>{timeAgo(p.updated_at)}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
