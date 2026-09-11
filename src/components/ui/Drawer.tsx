import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: 'md' | 'lg'
}

export default function Drawer({ open, onClose, title, subtitle, children, footer, width = 'md' }: DrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-base-950/70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={`relative h-full w-full ${width === 'lg' ? 'max-w-2xl' : 'max-w-md'} bg-base-900 border-l border-base-700 shadow-2xl flex flex-col animate-slide-in-right`}
      >
        <div className="flex items-start justify-between px-6 py-5 border-b border-base-700/80">
          <div>
            <h2 className="text-lg font-semibold text-ink-100">{title}</h2>
            {subtitle && <p className="text-sm text-ink-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-100 hover:bg-base-700 rounded-lg p-1.5 transition-colors focus-ring shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-base-700/80 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
