import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key && url.startsWith('http'))

export const supabase = isSupabaseConfigured
  ? createClient(url, key)
  : (null as any)

export const dbService = {
  mapDoc<T>(doc: any): T {
    // Supabase uses standard columns directly without $ prefixes
    return doc as T
  }
}
