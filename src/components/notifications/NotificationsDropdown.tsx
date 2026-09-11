import React, { useEffect, useRef, useState } from 'react'
import { Bell, Clock, CalendarClock, CheckCircle2, Wallet, RefreshCcw } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import { timeAgo } from '../../lib/format'
import type { NotificationKind } from '../../types'

const iconFor: Record<NotificationKind, React.ElementType> = {
  deadline: Clock,
  meeting: CalendarClock,
  completed: CheckCircle2,
  transaction: Wallet,
  update: RefreshCcw,
}

export default function NotificationsDropdown() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-100 hover:bg-base-800 transition-colors focus-ring"
        aria-label="Notifications"
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500 ring-2 ring-base-900" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 card p-0 overflow-hidden animate-scale-in origin-top-right z-30">
          <div className="flex items-center justify-between px-4 py-3 border-b border-base-700/80">
            <span className="text-sm font-medium text-ink-100">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-ink-500">You're all caught up.</div>
            )}
            {notifications.map((n) => {
              const Icon = iconFor[n.kind]
              return (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-base-800 transition-colors ${
                    !n.read ? 'bg-violet-500/5' : ''
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-base-800 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
                    <Icon size={13} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink-200 leading-snug">{n.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{n.description}</div>
                    <div className="text-[11px] text-ink-600 mt-1">{timeAgo(n.created_at)}</div>
                  </div>
                  {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 mt-1.5 shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
