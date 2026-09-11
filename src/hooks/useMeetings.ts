import { useCallback, useEffect, useState } from 'react'
import { db, subscribeToChanges } from '../lib/db'
import type { Meeting } from '../types'

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await db.getMeetings()
      setMeetings(data)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to load meetings')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const unsubscribe = subscribeToChanges(refresh)
    return unsubscribe
  }, [refresh])

  return { meetings, loading, error, refresh }
}
