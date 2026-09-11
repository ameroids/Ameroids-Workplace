import { useCallback, useEffect, useState } from 'react'
import { db, subscribeToChanges } from '../lib/db'
import type { Transaction } from '../types'

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setError(null)
      const data = await db.getTransactions()
      setTransactions(data)
    } catch (e: any) {
      setError(e?.message ?? 'Unable to load transactions')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const unsubscribe = subscribeToChanges(refresh)
    return unsubscribe
  }, [refresh])

  return { transactions, loading, error, refresh }
}
