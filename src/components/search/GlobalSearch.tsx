import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Search, FolderKanban, Wallet, CalendarClock, StickyNote, CornerDownLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import { useTransactions } from '../../hooks/useTransactions'
import { useMeetings } from '../../hooks/useMeetings'
import { formatDate, formatINR } from '../../lib/format'

interface Result {
  id: string
  kind: 'project' | 'transaction' | 'meeting' | 'note'
  title: string
  subtitle: string
  onSelect: () => void
}

export default function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { projects } = useProjects()
  const { transactions } = useTransactions()
  const { meetings } = useMeetings()

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 30)
    else setQuery('')
  }, [open])

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    const out: Result[] = []

    projects
      .filter((p) => p.name.toLowerCase().includes(q) || p.client.toLowerCase().includes(q))
      .forEach((p) =>
        out.push({
          id: p.id,
          kind: 'project',
          title: p.name,
          subtitle: `${p.client} · ${p.status}`,
          onSelect: () => navigate(`/projects?open=${p.id}`),
        }),
      )

    projects.forEach((p) =>
      p.updates
        .filter((u) => u.text.toLowerCase().includes(q))
        .forEach((u) =>
          out.push({
            id: u.id,
            kind: 'note',
            title: u.text,
            subtitle: `Update on ${p.name}`,
            onSelect: () => navigate(`/projects?open=${p.id}`),
          }),
        ),
    )

    transactions
      .filter((t) => t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q))
      .forEach((t) =>
        out.push({
          id: t.id,
          kind: 'transaction',
          title: t.description,
          subtitle: `${t.type} · ${formatINR(t.amount)} · ${formatDate(t.date)}`,
          onSelect: () => navigate('/accounts'),
        }),
      )

    meetings
      .filter((m) => m.title.toLowerCase().includes(q))
      .forEach((m) =>
        out.push({
          id: m.id,
          kind: 'meeting',
          title: m.title,
          subtitle: `${formatDate(m.date)} · ${m.time}`,
          onSelect: () => navigate(`/meetings?open=${m.id}`),
        }),
      )

    return out.slice(0, 20)
  }, [query, projects, transactions, meetings, navigate])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const iconFor = { project: FolderKanban, transaction: Wallet, meeting: CalendarClock, note: StickyNote }

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-start justify-center pt-[12vh] px-4">
      <div className="absolute inset-0 bg-base-950/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-xl card overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 h-14 border-b border-base-700/80">
          <Search size={17} className="text-ink-500 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, transactions, meetings, notes…"
            className="flex-1 bg-transparent text-sm text-ink-100 placeholder:text-ink-500 outline-none"
          />
          <kbd className="hidden sm:inline text-[10px] text-ink-500 border border-base-600 rounded px-1.5 py-0.5">Esc</kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto">
          {query.trim() === '' && (
            <div className="px-4 py-8 text-center text-sm text-ink-500">Start typing to search across your workspace.</div>
          )}
          {query.trim() !== '' && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-ink-500">No results for “{query}”.</div>
          )}
          {results.map((r) => {
            const Icon = iconFor[r.kind]
            return (
              <button
                key={`${r.kind}-${r.id}`}
                onClick={() => {
                  r.onSelect()
                  onClose()
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-base-800 text-left transition-colors focus-ring"
              >
                <div className="w-8 h-8 rounded-lg bg-base-800 flex items-center justify-center text-violet-400 shrink-0">
                  <Icon size={14} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink-100 truncate">{r.title}</div>
                  <div className="text-xs text-ink-500 truncate">{r.subtitle}</div>
                </div>
                <CornerDownLeft size={13} className="text-ink-600 shrink-0" />
              </button>
            )
          })}
        </div>
      </div>
    </div>,
    document.body,
  )
}
