import React, { useEffect, useMemo, useState } from 'react'
import { Plus, FolderKanban, Search } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import ProjectTable from '../components/projects/ProjectTable'
import ProjectDrawer from '../components/projects/ProjectDrawer'
import ProjectFormDrawer from '../components/projects/ProjectFormDrawer'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { TableRowSkeleton } from '../components/ui/Skeleton'
import type { Project, ProjectStatus } from '../types'
import { db } from '../lib/db'
import { useToast } from '../hooks/useToast'

const filters: (ProjectStatus | 'All')[] = ['All', 'Planning', 'Pending', 'In Progress', 'On Hold', 'Completed']

export default function Projects() {
  const { projects, loading, refresh } = useProjects()
  const [params, setParams] = useSearchParams()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Project | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleting, setDeleting] = useState<Project | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const openId = params.get('open')
    if (openId && projects.length) {
      const found = projects.find((p) => p.id === openId)
      if (found) setSelected(found)
    }
  }, [params, projects])

  useEffect(() => {
    if (selected) {
      const fresh = projects.find((p) => p.id === selected.id)
      if (fresh) setSelected(fresh)
    }
  }, [projects]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesFilter = filter === 'All' || p.status === filter
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)
      return matchesFilter && matchesQuery
    })
  }, [projects, filter, query])

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
      await db.deleteProject(deleting.id)
      showToast('Project deleted')
      refresh()
    } catch {
      showToast('Unable to delete project', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-100">Projects</h1>
          <p className="text-sm text-ink-500 mt-0.5">{projects.length} total · {projects.filter((p) => p.status !== 'Completed').length} active</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors focus-ring shrink-0"
        >
          <Plus size={16} /> New project
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 flex-1 bg-base-800/60 border border-base-600 rounded-lg px-3 py-2">
          <Search size={14} className="text-ink-500 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30' : 'text-ink-400 hover:text-ink-100 hover:bg-base-800 border border-transparent'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card overflow-hidden">
          <table className="w-full">
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length === 0 ? 'No projects yet' : 'No projects match your filters'}
          description={projects.length === 0 ? 'Create your first project to get started.' : 'Try a different search term or status filter.'}
          action={
            projects.length === 0 ? (
              <button
                onClick={() => setFormOpen(true)}
                className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors focus-ring"
              >
                Create project
              </button>
            ) : undefined
          }
        />
      ) : (
        <ProjectTable
          projects={filtered}
          onOpen={setSelected}
          onEdit={(p) => {
            setEditing(p)
            setFormOpen(true)
          }}
          onDelete={setDeleting}
        />
      )}

      <ProjectDrawer
        project={selected}
        open={Boolean(selected)}
        onClose={closeDrawer}
        onChanged={refresh}
        onEdit={() => {
          setEditing(selected)
          setFormOpen(true)
        }}
      />

      <ProjectFormDrawer
        open={formOpen}
        onClose={() => setFormOpen(false)}
        project={editing}
        onSaved={refresh}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete project"
        description={`This will permanently delete "${deleting?.name}" along with its updates and notes. This can't be undone.`}
        confirmLabel="Delete project"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
