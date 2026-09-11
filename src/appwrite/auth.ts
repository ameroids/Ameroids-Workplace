import { account, isAppwriteConfigured } from './config'
import { ID } from 'appwrite'

export const auth = {
  async register(email: string, password: string, name?: string) {
    if (!isAppwriteConfigured) throw new Error('Appwrite not configured')
    return account.create(ID.unique(), email, password, name)
  },

  async login(email: string, password: string) {
    if (!isAppwriteConfigured) throw new Error('Appwrite not configured')
    return account.createEmailPasswordSession(email, password)
  },

  async logout() {
    if (!isAppwriteConfigured) return
    return account.deleteSession('current')
  },

  async getCurrentUser() {
    if (!isAppwriteConfigured) return null
    try {
      return await account.get()
    } catch {
      return null
    }
  },

  async getCurrentSession() {
    if (!isAppwriteConfigured) return null
    try {
      return await account.getSession('current')
    } catch {
      return null
    }
  }
}
