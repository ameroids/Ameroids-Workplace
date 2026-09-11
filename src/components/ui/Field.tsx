import React from 'react'

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-400">{label}</span>
      {children}
      {hint && <span className="text-xs text-ink-500">{hint}</span>}
    </label>
  )
}

export const inputClass =
  'w-full bg-base-800 border border-base-600 rounded-lg px-3 py-2 text-sm text-ink-100 placeholder:text-ink-500 focus-ring focus:border-violet-500/60 transition-colors'

export const selectClass = inputClass + ' appearance-none'

export const textareaClass = inputClass + ' resize-none min-h-[80px]'
