import { useCallback, useEffect, useState } from 'react'
import { db, subscribeToChanges } from '../lib/db'
import type { AppNotification } from '../types'

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const data = await db.getNotifications()
      setNotifications(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
    const unsubscribe = subscribeToChanges(refresh)
    return unsubscribe
  }, [refresh])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markRead = async (id: string) => {
    await db.markNotificationRead(id)
    refresh()
  }

  const markAllRead = async () => {
    await db.markAllNotificationsRead()
    refresh()
  }

  return { notifications, unreadCount, loading, markRead, markAllRead, refresh }
}
