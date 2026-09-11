import { useCallback, useEffect, useState } from 'react'
import { db, subscribeToChanges } from '../lib/db'
import type { Project } from '../types'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await db.getProjects()
      setProjects(data)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const unsubscribe = subscribeToChanges(refresh)
    return unsubscribe
  }, [refresh])

  return { projects, loading, error, refresh }
}
