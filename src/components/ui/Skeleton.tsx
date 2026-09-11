import React from 'react'

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-base-700/70 rounded-md ${className}`} />
}

export function StatCardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="border-b border-base-700/60">
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="py-4 px-4">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function CardSkeleton() {
  return (
    <div className="card p-5 flex flex-col gap-3">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
      <Skeleton className="h-2 w-full" />
    </div>
  )
}
