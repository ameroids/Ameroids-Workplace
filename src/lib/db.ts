import { supabase, isSupabaseConfigured, dbService } from '../supabase/config'
import { localDb, ensureSeeded, subscribeLocal } from './storage'
import type { Project, Transaction, Meeting, ActivityLog, WorkspaceSettings, AppNotification, ProjectUpdate, ProjectNote } from '../types'

/**
 * db.ts is the only module the hooks talk to. It exposes one async API and
 * internally decides, based on `isSupabaseConfigured`, whether to hit
 * Supabase or the LocalStorage demo layer in `storage.ts`.
 */

if (!isSupabaseConfigured) ensureSeeded()

export const backendMode: 'supabase' | 'local' = isSupabaseConfigured ? 'supabase' : 'local'

async function mapProjectRow(row: any): Promise<Project> {
  const [updatesRes, notesRes] = await Promise.all([
    supabase.from('project_updates').select('*').eq('project_id', row.id).order('created_at', { ascending: false }),
    supabase.from('project_notes').select('*').eq('project_id', row.id).order('created_at', { ascending: false })
  ])
  
  return { 
    ...dbService.mapDoc<any>(row), 
    updates: (updatesRes.data || []).map((d: any) => dbService.mapDoc<ProjectUpdate>(d)), 
    notes: (notesRes.data || []).map((d: any) => dbService.mapDoc<ProjectNote>(d)) 
  } as Project
}

export const db = {
  async getProjects(): Promise<Project[]> {
    if (!isSupabaseConfigured) return localDb.getProjects()
    const response = await supabase.from('projects').select('*').order('created_at', { ascending: false })
    if (response.error) throw response.error
    return Promise.all((response.data || []).map(mapProjectRow))
  },

  async createProject(input: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'updates' | 'notes'>): Promise<Project> {
    if (!isSupabaseConfigured) return localDb.createProject(input)
    const { data: doc, error } = await supabase.from('projects').insert(input).select().single()
    if (error) throw error
    
    await supabase.from('activity_logs').insert({ 
      kind: 'project_created', 
      description: `${doc.name} added as a new project` 
    })
    return { ...dbService.mapDoc<any>(doc), updates: [], notes: [] }
  },

  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    if (!isSupabaseConfigured) {
      const updated = localDb.updateProject(id, patch)
      if (!updated) throw new Error('Project not found')
      return updated
    }
    const { updates, notes, id: _id, created_at, updated_at, ...rest } = patch as any
    const { data: doc, error } = await supabase.from('projects').update(rest).eq('id', id).select().single()
    if (error) throw error
    
    if (patch.status === 'Completed') {
      await supabase.from('activity_logs').insert({ 
        kind: 'project_status', 
        description: `${doc.name} marked as Completed` 
      })
    } else if (typeof patch.progress === 'number') {
      await supabase.from('activity_logs').insert({ 
        kind: 'project_progress', 
        description: `${doc.name} progress updated to ${patch.progress}%` 
      })
    }
    return mapProjectRow(doc)
  },

  async deleteProject(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localDb.deleteProject(id)
    await supabase.from('projects').delete().eq('id', id)
  },

  async addProjectUpdate(projectId: string, text: string, author = 'Ammar'): Promise<ProjectUpdate> {
    if (!isSupabaseConfigured) {
      localDb.addProjectUpdate(projectId, text, author)
      return { id: crypto.randomUUID(), project_id: projectId, text, author, created_at: new Date().toISOString() }
    }
    const { data: doc, error } = await supabase.from('project_updates').insert({ 
      project_id: projectId, 
      text, 
      author 
    }).select().single()
    if (error) throw error
    
    await supabase.from('activity_logs').insert({ 
      kind: 'project_update', 
      description: text 
    })
    return dbService.mapDoc<ProjectUpdate>(doc)
  },

  async addProjectNote(projectId: string, text: string): Promise<ProjectNote> {
    if (!isSupabaseConfigured) {
      localDb.addProjectNote(projectId, text)
      return { id: crypto.randomUUID(), project_id: projectId, text, created_at: new Date().toISOString() }
    }
    const { data: doc, error } = await supabase.from('project_notes').insert({ 
      project_id: projectId, 
      text 
    }).select().single()
    if (error) throw error
    
    return dbService.mapDoc<ProjectNote>(doc)
  },

  async getTransactions(): Promise<Transaction[]> {
    if (!isSupabaseConfigured) return localDb.getTransactions()
    const { data, error } = await supabase.from('transactions').select('*').order('date', { ascending: false })
    if (error) throw error
    return (data || []).map((d: any) => dbService.mapDoc<Transaction>(d))
  },

  async createTransaction(input: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    if (!isSupabaseConfigured) return localDb.createTransaction(input)
    const { data: doc, error } = await supabase.from('transactions').insert(input).select().single()
    if (error) throw error
    
    await supabase.from('activity_logs').insert({ 
      kind: 'transaction', 
      description: `₹${input.amount.toLocaleString('en-IN')} ${input.type.toLowerCase()} — ${input.description}` 
    })
    
    if (input.type === 'Received') {
      const wajebatAmount = input.amount * 0.2
      await supabase.from('transactions').insert({
        type: 'Wajebat',
        amount: wajebatAmount,
        description: `Auto-deducted 20% Wajebat from ${input.description}`,
        category: 'Wajebat',
        date: input.date,
        notes: ''
      })
      await supabase.from('activity_logs').insert({ 
        kind: 'transaction', 
        description: `₹${wajebatAmount.toLocaleString('en-IN')} wajebat auto-deducted` 
      })
    }
    
    return dbService.mapDoc<Transaction>(doc)
  },

  async updateTransaction(id: string, patch: Partial<Transaction>): Promise<Transaction> {
    if (!isSupabaseConfigured) {
      const updated = localDb.updateTransaction(id, patch)
      if (!updated) throw new Error('Transaction not found')
      return updated
    }
    const { id: _id, created_at, ...rest } = patch as any
    const { data: doc, error } = await supabase.from('transactions').update(rest).eq('id', id).select().single()
    if (error) throw error
    return dbService.mapDoc<Transaction>(doc)
  },

  async deleteTransaction(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localDb.deleteTransaction(id)
    
    const { data: tx } = await supabase.from('transactions').select('*').eq('id', id).single()
    
    await supabase.from('transactions').delete().eq('id', id)
    
    if (tx?.description) {
      const { data: logs } = await supabase.from('activity_logs').select('*').eq('kind', 'transaction').ilike('description', `%${tx.description}%`)
      if (logs) {
        for (const log of logs) {
          await supabase.from('activity_logs').delete().eq('id', log.id)
        }
      }
    }
  },

  async getMeetings(): Promise<Meeting[]> {
    if (!isSupabaseConfigured) return localDb.getMeetings()
    const { data, error } = await supabase.from('meetings').select('*').order('date', { ascending: true })
    if (error) throw error
    return (data || []).map((d: any) => dbService.mapDoc<Meeting>(d))
  },

  async createMeeting(input: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>): Promise<Meeting> {
    if (!isSupabaseConfigured) return localDb.createMeeting(input)
    const { data: doc, error } = await supabase.from('meetings').insert(input).select().single()
    if (error) throw error
    
    await supabase.from('activity_logs').insert({ 
      kind: 'meeting_created', 
      description: `${input.title} meeting added` 
    })
    return dbService.mapDoc<Meeting>(doc)
  },

  async updateMeeting(id: string, patch: Partial<Meeting>): Promise<Meeting> {
    if (!isSupabaseConfigured) {
      const updated = localDb.updateMeeting(id, patch)
      if (!updated) throw new Error('Meeting not found')
      return updated
    }
    const { id: _id, created_at, updated_at, ...rest } = patch as any
    const { data: doc, error } = await supabase.from('meetings').update(rest).eq('id', id).select().single()
    if (error) throw error
    
    await supabase.from('activity_logs').insert({ 
      kind: 'meeting_updated', 
      description: `${doc.title} was updated` 
    })
    return dbService.mapDoc<Meeting>(doc)
  },

  async deleteMeeting(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localDb.deleteMeeting(id)
    await supabase.from('meetings').delete().eq('id', id)
  },

  async getActivity(): Promise<ActivityLog[]> {
    if (!isSupabaseConfigured) return localDb.getActivity()
    const { data, error } = await supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(100)
    if (error) throw error
    return (data || []).map((d: any) => dbService.mapDoc<ActivityLog>(d))
  },

  async getNotifications(): Promise<AppNotification[]> {
    if (!isSupabaseConfigured) {
      localDb.generateDeadlineNotifications()
      return localDb.getNotifications()
    }
    return []
  },

  async markNotificationRead(id: string): Promise<void> {
    if (!isSupabaseConfigured) return localDb.markNotificationRead(id)
  },

  async markAllNotificationsRead(): Promise<void> {
    if (!isSupabaseConfigured) return localDb.markAllNotificationsRead()
  },

  async getSettings(): Promise<WorkspaceSettings> {
    if (!isSupabaseConfigured) return localDb.getSettings()
    
    try {
      const { data, error } = await supabase.from('profiles').select('*').limit(1).single()
      if (!error && data) {
        return {
          workspace_name: data.workspace_name ?? 'Ameroids',
          currency: 'INR',
          theme: 'dark',
          notifications_enabled: data.notifications_enabled ?? true,
          time_zone: data.time_zone ?? 'Asia/Kolkata',
          date_format: data.date_format ?? 'DD MMM YYYY'
        }
      }
    } catch {
      // Ignored
    }

    return {
      workspace_name: 'Ameroids',
      currency: 'INR',
      theme: 'dark',
      notifications_enabled: true,
      time_zone: 'Asia/Kolkata',
      date_format: 'DD MMM YYYY'
    }
  },

  async updateSettings(patch: Partial<WorkspaceSettings>): Promise<WorkspaceSettings> {
    if (!isSupabaseConfigured) return localDb.updateSettings(patch)
    
    let currentSettingsId = null
    
    try {
      const { data, error } = await supabase.from('profiles').select('id').limit(1).single()
      if (!error && data) {
        currentSettingsId = data.id
      }
    } catch {
      // Ignored
    }

    const next: WorkspaceSettings = { workspace_name: 'Ameroids', currency: 'INR', theme: 'dark', notifications_enabled: true, time_zone: 'Asia/Kolkata', date_format: 'DD MMM YYYY', ...patch }
    
    if (currentSettingsId) {
      await supabase.from('profiles').update(patch).eq('id', currentSettingsId)
    } else {
      await supabase.from('profiles').insert(next)
    }
    
    return next
  },

  resetDemoData(): void {
    if (!isSupabaseConfigured) localDb.resetDemoData()
  },
}

export function subscribeToChanges(onChange: () => void): () => void {
  if (!isSupabaseConfigured) {
    return subscribeLocal(onChange)
  }
  
  const tables = ['projects', 'transactions', 'meetings', 'activity_logs']
  
  const channels = tables.map(table => 
    supabase.channel(`public:${table}`).on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      () => onChange()
    )
  )

  channels.forEach(channel => channel.subscribe())

  return () => {
    channels.forEach(channel => supabase.removeChannel(channel))
  }
}
