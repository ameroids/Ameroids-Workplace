import React from 'react'
import { Activity as ActivityIcon } from 'lucide-react'
import { useActivity } from '../hooks/useActivity'
import ActivityTimeline from '../components/activity/ActivityTimeline'
import EmptyState from '../components/ui/EmptyState'
import { CardSkeleton } from '../components/ui/Skeleton'

export default function Activity() {
  const { activity, loading } = useActivity()

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-ink-100">Activity</h1>
        <p className="text-sm text-ink-500 mt-0.5">A live feed of everything happening across the Ameorids workspace.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : activity.length === 0 ? (
        <EmptyState icon={ActivityIcon} title="No activity yet" description="Actions across projects, accounts, and meetings will appear here as they happen." />
      ) : (
        <div className="card p-6">
          <ActivityTimeline activity={activity} />
        </div>
      )}
    </div>
  )
}
