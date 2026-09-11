import { ID, Query } from 'appwrite'
import { databases, config, isAppwriteConfigured } from '../appwrite/config'
import { dbService } from '../appwrite/database'
import { realtime } from '../appwrite/realtime'
import { localDb, ensureSeeded, subscribeLocal } from './storage'
import type { Project, Transaction, Meeting, ActivityLog, WorkspaceSettings, AppNotification, ProjectUpdate, ProjectNote } from '../types'

/**
 * db.ts is the only module the hooks talk to. It exposes one async API and
 * internally decides, based on `isAppwriteConfigured`, whether to hit
 * Appwrite or the LocalStorage demo layer in `storage.ts`.
 */

if (!isAppwriteConfigured) ensureSeeded()

export const backendMode: 'appwrite' | 'local' = isAppwriteConfigured ? 'appwrite' : 'local'

async function mapProjectRow(row: any): Promise<Project> {
  const [updatesRes, notesRes] = await Promise.all([
    databases.listDocuments(config.databaseId, config.collections.projectUpdates, [
      Query.equal('project_id', row.$id),
      Query.orderDesc('$createdAt')
    ]),
    databases.listDocuments(config.databaseId, config.collections.projectNotes, [
      Query.equal('project_id', row.$id),
      Query.orderDesc('$createdAt')
    ])
  ])
  
  return { 
    ...dbService.mapDoc<any>(row), 
    updates: updatesRes.documents.map(d => dbService.mapDoc<ProjectUpdate>(d)), 
    notes: notesRes.documents.map(d => dbService.mapDoc<ProjectNote>(d)) 
  } as Project
}

export const db = {
  async getProjects(): Promise<Project[]> {
    if (!isAppwriteConfigured) return localDb.getProjects()
    const response = await databases.listDocuments(config.databaseId, config.collections.projects, [
      Query.orderDesc('$createdAt')
    ])
    return Promise.all(response.documents.map(mapProjectRow))
  },

  async createProject(input: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'updates' | 'notes'>): Promise<Project> {
    if (!isAppwriteConfigured) return localDb.createProject(input)
    const doc = await databases.createDocument(config.databaseId, config.collections.projects, ID.unique(), input)
    const projectDoc = doc as any
    await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
      kind: 'project_created', 
      description: `${projectDoc.name} added as a new project` 
    })
    return { ...dbService.mapDoc<any>(doc), updates: [], notes: [] }
  },

  async updateProject(id: string, patch: Partial<Project>): Promise<Project> {
    if (!isAppwriteConfigured) {
      const updated = localDb.updateProject(id, patch)
      if (!updated) throw new Error('Project not found')
      return updated
    }
    const { updates, notes, id: _id, created_at, updated_at, ...rest } = patch as any
    const doc = await databases.updateDocument(config.databaseId, config.collections.projects, id, rest)
    const projectDoc = doc as any
    
    if (patch.status === 'Completed') {
      await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
        kind: 'project_status', 
        description: `${projectDoc.name} marked as Completed` 
      })
    } else if (typeof patch.progress === 'number') {
      await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
        kind: 'project_progress', 
        description: `${projectDoc.name} progress updated to ${patch.progress}%` 
      })
    }
    return mapProjectRow(doc)
  },

  async deleteProject(id: string): Promise<void> {
    if (!isAppwriteConfigured) return localDb.deleteProject(id)
    await databases.deleteDocument(config.databaseId, config.collections.projects, id)
  },

  async addProjectUpdate(projectId: string, text: string, author = 'Ammar'): Promise<ProjectUpdate> {
    if (!isAppwriteConfigured) {
      localDb.addProjectUpdate(projectId, text, author)
      return { id: crypto.randomUUID(), project_id: projectId, text, author, created_at: new Date().toISOString() }
    }
    const doc = await databases.createDocument(config.databaseId, config.collections.projectUpdates, ID.unique(), { 
      project_id: projectId, 
      text, 
      author 
    })
    await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
      kind: 'project_update', 
      description: text 
    })
    return dbService.mapDoc<ProjectUpdate>(doc)
  },

  async addProjectNote(projectId: string, text: string): Promise<ProjectNote> {
    if (!isAppwriteConfigured) {
      localDb.addProjectNote(projectId, text)
      return { id: crypto.randomUUID(), project_id: projectId, text, created_at: new Date().toISOString() }
    }
    const doc = await databases.createDocument(config.databaseId, config.collections.projectNotes, ID.unique(), { 
      project_id: projectId, 
      text 
    })
    return dbService.mapDoc<ProjectNote>(doc)
  },

  async getTransactions(): Promise<Transaction[]> {
    if (!isAppwriteConfigured) return localDb.getTransactions()
    const response = await databases.listDocuments(config.databaseId, config.collections.transactions, [
      Query.orderDesc('date')
    ])
    return response.documents.map(d => dbService.mapDoc<Transaction>(d))
  },

  async createTransaction(input: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction> {
    if (!isAppwriteConfigured) return localDb.createTransaction(input)
    const doc = await databases.createDocument(config.databaseId, config.collections.transactions, ID.unique(), input)
    await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
      kind: 'transaction', 
      description: `₹${input.amount.toLocaleString('en-IN')} ${input.type.toLowerCase()} — ${input.description}` 
    })
    
    if (input.type === 'Received') {
      const wajebatAmount = input.amount * 0.2
      await databases.createDocument(config.databaseId, config.collections.transactions, ID.unique(), {
        type: 'Wajebat',
        amount: wajebatAmount,
        description: `Auto-deducted 20% Wajebat from ${input.description}`,
        category: 'Wajebat',
        date: input.date,
        notes: ''
      })
      await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
        kind: 'transaction', 
        description: `₹${wajebatAmount.toLocaleString('en-IN')} wajebat auto-deducted` 
      })
    }
    
    return dbService.mapDoc<Transaction>(doc)
  },

  async updateTransaction(id: string, patch: Partial<Transaction>): Promise<Transaction> {
    if (!isAppwriteConfigured) {
      const updated = localDb.updateTransaction(id, patch)
      if (!updated) throw new Error('Transaction not found')
      return updated
    }
    const { id: _id, created_at, ...rest } = patch as any
    const doc = await databases.updateDocument(config.databaseId, config.collections.transactions, id, rest)
    return dbService.mapDoc<Transaction>(doc)
  },

  async deleteTransaction(id: string): Promise<void> {
    if (!isAppwriteConfigured) return localDb.deleteTransaction(id)
    
    const tx = await databases.getDocument(config.databaseId, config.collections.transactions, id)
    
    await databases.deleteDocument(config.databaseId, config.collections.transactions, id)
    
    if (tx?.description) {
      // Find matching activity logs
      const logs = await databases.listDocuments(config.databaseId, config.collections.activityLogs, [
        Query.equal('kind', 'transaction'),
        Query.search('description', tx.description)
      ])
      
      for (const log of logs.documents) {
        await databases.deleteDocument(config.databaseId, config.collections.activityLogs, log.$id)
      }
    }
  },

  async getMeetings(): Promise<Meeting[]> {
    if (!isAppwriteConfigured) return localDb.getMeetings()
    const response = await databases.listDocuments(config.databaseId, config.collections.meetings, [
      Query.orderAsc('date')
    ])
    return response.documents.map(d => dbService.mapDoc<Meeting>(d))
  },

  async createMeeting(input: Omit<Meeting, 'id' | 'created_at' | 'updated_at'>): Promise<Meeting> {
    if (!isAppwriteConfigured) return localDb.createMeeting(input)
    const doc = await databases.createDocument(config.databaseId, config.collections.meetings, ID.unique(), input)
    await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
      kind: 'meeting_created', 
      description: `${input.title} meeting added` 
    })
    return dbService.mapDoc<Meeting>(doc)
  },

  async updateMeeting(id: string, patch: Partial<Meeting>): Promise<Meeting> {
    if (!isAppwriteConfigured) {
      const updated = localDb.updateMeeting(id, patch)
      if (!updated) throw new Error('Meeting not found')
      return updated
    }
    const { id: _id, created_at, updated_at, ...rest } = patch as any
    const doc = await databases.updateDocument(config.databaseId, config.collections.meetings, id, rest)
    await databases.createDocument(config.databaseId, config.collections.activityLogs, ID.unique(), { 
      kind: 'meeting_updated', 
      description: `${doc.title} was updated` 
    })
    return dbService.mapDoc<Meeting>(doc)
  },

  async deleteMeeting(id: string): Promise<void> {
    if (!isAppwriteConfigured) return localDb.deleteMeeting(id)
    await databases.deleteDocument(config.databaseId, config.collections.meetings, id)
  },

  async getActivity(): Promise<ActivityLog[]> {
    if (!isAppwriteConfigured) return localDb.getActivity()
    const response = await databases.listDocuments(config.databaseId, config.collections.activityLogs, [
      Query.orderDesc('$createdAt'),
      Query.limit(100)
    ])
    return response.documents.map(d => dbService.mapDoc<ActivityLog>(d))
  },

  async getNotifications(): Promise<AppNotification[]> {
    if (!isAppwriteConfigured) {
      localDb.generateDeadlineNotifications()
      return localDb.getNotifications()
    }
    // Similar to old Supabase impl, notifications could be populated server-side
    return []
  },

  async markNotificationRead(id: string): Promise<void> {
    if (!isAppwriteConfigured) return localDb.markNotificationRead(id)
  },

  async markAllNotificationsRead(): Promise<void> {
    if (!isAppwriteConfigured) return localDb.markAllNotificationsRead()
  },

  async getSettings(): Promise<WorkspaceSettings> {
    if (!isAppwriteConfigured) return localDb.getSettings()
    
    try {
      const response = await databases.listDocuments(config.databaseId, config.collections.profiles, [
        Query.limit(1)
      ])
      
      if (response.documents.length > 0) {
        const data = response.documents[0]
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
    if (!isAppwriteConfigured) return localDb.updateSettings(patch)
    
    let currentSettingsId = null;
    
    try {
      const response = await databases.listDocuments(config.databaseId, config.collections.profiles, [
        Query.limit(1)
      ])
      if (response.documents.length > 0) {
        currentSettingsId = response.documents[0].$id
      }
    } catch {
      // Ignored
    }

    const next: WorkspaceSettings = { workspace_name: 'Ameroids', currency: 'INR', theme: 'dark', notifications_enabled: true, time_zone: 'Asia/Kolkata', date_format: 'DD MMM YYYY', ...patch }
    
    if (currentSettingsId) {
      await databases.updateDocument(config.databaseId, config.collections.profiles, currentSettingsId, patch)
    } else {
      await databases.createDocument(config.databaseId, config.collections.profiles, ID.unique(), next)
    }
    
    return next
  },

  resetDemoData(): void {
    if (!isAppwriteConfigured) localDb.resetDemoData()
  },
}

export function subscribeToChanges(onChange: () => void): () => void {
  if (!isAppwriteConfigured) {
    return subscribeLocal(onChange)
  }
  return realtime.subscribeToChanges(onChange)
}
