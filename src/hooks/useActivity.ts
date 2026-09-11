import { useCallback, useEffect, useState } from 'react'
import { db, subscribeToChanges } from '../lib/db'
import type { ActivityLog } from '../types'

export function useActivity() {
  const [activity, setActivity] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await db.getActivity()
      setActivity(data)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to load activity')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const unsubscribe = subscribeToChanges(refresh)
    return unsubscribe
  }, [refresh])

  return { activity, loading, error, refresh }
}
