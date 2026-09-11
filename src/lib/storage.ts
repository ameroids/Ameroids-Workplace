import type { Project, Transaction, Meeting, ActivityLog, WorkspaceSettings, AppNotification } from '../types'
import { uid } from './format'

/**
 * Local demo/development data layer. When Supabase is not configured
 * (see lib/supabase.ts), the app reads and writes everything here instead,
 * so the product is fully usable out of the box with `npm install && npm run dev`.
 */

const KEYS = {
  projects: 'ameorids.projects',
  transactions: 'ameorids.transactions',
  meetings: 'ameorids.meetings',
  activity: 'ameorids.activity',
  settings: 'ameorids.settings',
  notifications: 'ameorids.notifications',
  seeded: 'ameorids.seeded',
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function ensureSeeded() {
  if (read('ameorids.force_cleared_v1', false)) return
  write(KEYS.projects, [])
  write(KEYS.transactions, [])
  write(KEYS.meetings, [])
  write(KEYS.activity, [])
  write<WorkspaceSettings>(KEYS.settings, {
    workspace_name: 'Ameroids',
    currency: 'INR',
    theme: 'dark',
    notifications_enabled: true,
    time_zone: 'Asia/Kolkata',
    date_format: 'DD MMM YYYY',
  })
  write<AppNotification[]>(KEYS.notifications, [])
  write(KEYS.seeded, true)
  write('ameorids.force_cleared_v1', true)
}

// A tiny pub/sub so hooks in different components stay in sync when data
// changes anywhere in the app (mirrors how Supabase Realtime would notify
// multiple subscribers of the same table).
type Listener = () => void
const listeners = new Set<Listener>()
export function subscribeLocal(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}
function notify() {
  listeners.forEach((fn) => fn())
}

function logActivity(entry: Omit<ActivityLog, 'id' | 'created_at'>) {
  const activity = read<ActivityLog[]>(KEYS.activity, [])
  activity.unshift({ ...entry, id: uid(), created_at: new Date().toISOString() })
  write(KEYS.activity, activity.slice(0, 200))
}

function pushNotification(entry: Omit<AppNotification, 'id' | 'created_at' | 'read'>) {
  const list = read<AppNotification[]>(KEYS.notifications, [])
  list.unshift({ ...entry, id: uid(), created_at: new Date().toISOString(), read: false })
  write(KEYS.notifications, list.slice(0, 50))
}

export const localDb = {
  // ---- Projects ----
  getProjects(): Project[] {
    return read<Project[]>(KEYS.projects, [])
  },
  createProject(input: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'updates' | 'notes'>): Project {
    const projects = read<Project[]>(KEYS.projects, [])
    const project: Project = {
      ...input,
      id: uid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updates: [],
      notes: [],
    }
    write(KEYS.projects, [project, ...projects])
    logActivity({ kind: 'project_created', description: `${project.name} added as a new project` })
    pushNotification({ kind: 'update', title: 'Project created', description: `${project.name} was added.` })
    notify()
    return project
  },
  updateProject(id: string, patch: Partial<Project>): Project | undefined {
    const projects = read<Project[]>(KEYS.projects, [])
    let updated: Project | undefined
    const next = projects.map((p) => {
      if (p.id !== id) return p
      updated = { ...p, ...patch, updated_at: new Date().toISOString() }
      return updated
    })
    write(KEYS.projects, next)
    if (updated) {
      if (patch.status && patch.status === 'Completed') {
        logActivity({ kind: 'project_status', description: `${updated.name} marked as Completed` })
        pushNotification({ kind: 'completed', title: 'Project completed', description: `${updated.name} is now complete.` })
      } else if (patch.status) {
        logActivity({ kind: 'project_status', description: `${updated.name} status changed to ${patch.status}` })
      }
      if (typeof patch.progress === 'number') {
        logActivity({ kind: 'project_progress', description: `${updated.name} progress updated to ${patch.progress}%` })
      }
    }
    notify()
    return updated
  },
  deleteProject(id: string) {
    const projects = read<Project[]>(KEYS.projects, [])
    const project = projects.find((p) => p.id === id)
    write(KEYS.projects, projects.filter((p) => p.id !== id))
    if (project) logActivity({ kind: 'project_status', description: `${project.name} was deleted` })
    notify()
  },
  addProjectUpdate(projectId: string, text: string, author = 'Ammar') {
    const projects = read<Project[]>(KEYS.projects, [])
    let projectName = ''
    const next = projects.map((p) => {
      if (p.id !== projectId) return p
      projectName = p.name
      return {
        ...p,
        updated_at: new Date().toISOString(),
        updates: [{ id: uid(), project_id: projectId, text, author, created_at: new Date().toISOString() }, ...p.updates],
      }
    })
    write(KEYS.projects, next)
    logActivity({ kind: 'project_update', description: `${projectName}: ${text}` })
    pushNotification({ kind: 'update', title: `${projectName} updated`, description: text })
    notify()
  },
  addProjectNote(projectId: string, text: string) {
    const projects = read<Project[]>(KEYS.projects, [])
    const next = projects.map((p) =>
      p.id !== projectId
        ? p
        : { ...p, notes: [{ id: uid(), project_id: projectId, text, created_at: new Date().toISOString() }, ...p.notes] },
    )
    write(KEYS.projects, next)
    notify()
  },

  // ---- Transactions ----
  getTransactions(): Transaction[] {
    return read<Transaction[]>(KEYS.transactions, [])
  },
  createTransaction(input: Omit<Transaction, 'id' | 'created_at'>): Transaction {
    const list = read<Transaction[]>(KEYS.transactions, [])
    const tx: Transaction = { ...input, id: uid(), created_at: new Date().toISOString() }
    const newTransactions = [tx]
    
    if (input.type === 'Received') {
      const wajebatAmount = input.amount * 0.2
      const wajebatTx: Transaction = {
        id: uid(),
        type: 'Wajebat',
        amount: wajebatAmount,
        description: `Auto-deducted 20% Wajebat from ${input.description}`,
        category: 'Wajebat',
        date: input.date,
        notes: '',
        created_at: new Date().toISOString()
      }
      newTransactions.push(wajebatTx)
      logActivity({
        kind: 'transaction',
        description: `${formatShort(wajebatAmount)} wajebat auto-deducted`
      })
    }
    
    write(KEYS.transactions, [...newTransactions, ...list])
    
    logActivity({
      kind: 'transaction',
      description: `${formatShort(tx.amount)} ${tx.type.toLowerCase()}${tx.type === 'Received' ? ' from' : ' —'} ${tx.description}`,
    })
    pushNotification({ kind: 'transaction', title: `${tx.type} recorded`, description: `${formatShort(tx.amount)} — ${tx.description}` })
    notify()
    return tx
  },
  updateTransaction(id: string, patch: Partial<Transaction>): Transaction | undefined {
    const list = read<Transaction[]>(KEYS.transactions, [])
    let updated: Transaction | undefined
    const next = list.map((t) => (t.id === id ? (updated = { ...t, ...patch }) : t))
    write(KEYS.transactions, next)
    notify()
    return updated
  },
  deleteTransaction(id: string) {
    const list = read<Transaction[]>(KEYS.transactions, [])
    const transaction = list.find((t) => t.id === id)
    write(KEYS.transactions, list.filter((t) => t.id !== id))
    
    if (transaction) {
      const activity = read<ActivityLog[]>(KEYS.activity, [])
      const filteredActivity = activity.filter(a => !(a.kind === 'transaction' && a.description.includes(transaction.description)))
      write(KEYS.activity, filteredActivity)
    }
    
    notify()
  },

  // ---- Meetings ----
  getMeetings(): Meeting[] {
    return read<Meeting[]>(KEYS.meetings, [])
  },
  createMeeting(input: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>): Meeting {
    const list = read<Meeting[]>(KEYS.meetings, [])
    const meeting: Meeting = { ...input, id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    write(KEYS.meetings, [meeting, ...list])
    logActivity({ kind: 'meeting_created', description: `${meeting.title} meeting added` })
    pushNotification({ kind: 'meeting', title: 'Meeting scheduled', description: `${meeting.title} on ${meeting.date}` })
    notify()
    return meeting
  },
  updateMeeting(id: string, patch: Partial<Meeting>): Meeting | undefined {
    const list = read<Meeting[]>(KEYS.meetings, [])
    let updated: Meeting | undefined
    const next = list.map((m) => (m.id === id ? (updated = { ...m, ...patch, updated_at: new Date().toISOString() }) : m))
    write(KEYS.meetings, next)
    if (updated) logActivity({ kind: 'meeting_updated', description: `${updated.title} was updated` })
    notify()
    return updated
  },
  deleteMeeting(id: string) {
    const list = read<Meeting[]>(KEYS.meetings, [])
    write(KEYS.meetings, list.filter((m) => m.id !== id))
    notify()
  },

  // ---- Activity ----
  getActivity(): ActivityLog[] {
    return read<ActivityLog[]>(KEYS.activity, [])
  },

  // ---- Notifications ----
  getNotifications(): AppNotification[] {
    return read<AppNotification[]>(KEYS.notifications, [])
  },
  markNotificationRead(id: string) {
    const list = read<AppNotification[]>(KEYS.notifications, [])
    write(KEYS.notifications, list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    notify()
  },
  markAllNotificationsRead() {
    const list = read<AppNotification[]>(KEYS.notifications, [])
    write(KEYS.notifications, list.map((n) => ({ ...n, read: true })))
    notify()
  },
  generateDeadlineNotifications() {
    // Called on load to surface upcoming-deadline / upcoming-meeting nudges,
    // approximating what a Supabase scheduled function would do server-side.
    const projects = read<Project[]>(KEYS.projects, [])
    const meetings = read<Meeting[]>(KEYS.meetings, [])
    const existing = read<AppNotification[]>(KEYS.notifications, [])
    const seenTitles = new Set(existing.map((n) => n.title))
    const additions: AppNotification[] = []
    const now = new Date()
    for (const p of projects) {
      if (!p.due_date || p.status === 'Completed') continue
      const days = Math.round((new Date(p.due_date).getTime() - now.getTime()) / 86400000)
      if (days >= 0 && days <= 5) {
        const title = `${p.name} deadline approaching`
        if (!seenTitles.has(title)) {
          additions.push({ id: uid(), kind: 'deadline', title, description: `Due in ${days} day${days === 1 ? '' : 's'}`, created_at: new Date().toISOString(), read: false })
        }
      }
    }
    for (const m of meetings) {
      if (m.status !== 'Upcoming') continue
      const days = Math.round((new Date(m.date).getTime() - now.getTime()) / 86400000)
      if (days >= 0 && days <= 2) {
        const title = `${m.title} coming up`
        if (!seenTitles.has(title)) {
          additions.push({ id: uid(), kind: 'meeting', title, description: `${m.date} at ${m.time}`, created_at: new Date().toISOString(), read: false })
        }
      }
    }
    if (additions.length) {
      write(KEYS.notifications, [...additions, ...existing].slice(0, 50))
      notify()
    }
  },

  // ---- Settings ----
  getSettings(): WorkspaceSettings {
    return read<WorkspaceSettings>(KEYS.settings, {
      workspace_name: 'Ameorids',
      currency: 'INR',
      theme: 'dark',
      notifications_enabled: true,
      time_zone: 'Asia/Kolkata',
      date_format: 'DD MMM YYYY',
    })
  },
  updateSettings(patch: Partial<WorkspaceSettings>): WorkspaceSettings {
    const current = localDb.getSettings()
    const next = { ...current, ...patch }
    write(KEYS.settings, next)
    notify()
    return next
  },

  resetDemoData() {
    localStorage.removeItem(KEYS.seeded)
    ensureSeeded()
    notify()
  },
}

function formatShort(amount: number): string {
  return `₹${Math.abs(amount).toLocaleString('en-IN')}`
}
