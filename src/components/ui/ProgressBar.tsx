import React from 'react'

export default function ProgressBar({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const clamped = Math.max(0, Math.min(100, value))
  const height = size === 'sm' ? 'h-1.5' : 'h-2'
  return (
    <div className={`w-full bg-base-700 rounded-full ${height} overflow-hidden`}>
      <div
        className={`${height} rounded-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500 ease-out`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
