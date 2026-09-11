import { Client, Account, Databases } from 'appwrite'

const url = import.meta.env.VITE_APPWRITE_ENDPOINT
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID

export const isAppwriteConfigured = Boolean(url && projectId && url.startsWith('http'))

export const client = new Client()

if (isAppwriteConfigured) {
  client.setEndpoint(url as string).setProject(projectId as string)
}

export const account = new Account(client)
export const databases = new Databases(client)

export const config = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || '',
  collections: {
    projects: import.meta.env.VITE_APPWRITE_PROJECTS_COLLECTION_ID || 'projects',
    projectUpdates: import.meta.env.VITE_APPWRITE_PROJECT_UPDATES_COLLECTION_ID || 'project_updates',
    projectNotes: import.meta.env.VITE_APPWRITE_PROJECT_NOTES_COLLECTION_ID || 'project_notes',
    transactions: import.meta.env.VITE_APPWRITE_TRANSACTIONS_COLLECTION_ID || 'transactions',
    meetings: import.meta.env.VITE_APPWRITE_MEETINGS_COLLECTION_ID || 'meetings',
    activityLogs: import.meta.env.VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID || 'activity_logs',
    profiles: import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID || 'profiles',
  }
}
