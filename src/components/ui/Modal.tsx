import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  width?: 'sm' | 'md' | 'lg'
}

const widthClass = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' }

export default function Modal({ open, onClose, title, description, children, width = 'md' }: ModalProps) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-base-950/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className={`relative w-full ${widthClass[width]} card p-6 animate-scale-in max-h-[85vh] overflow-y-auto`}>
        <div className="flex items-start justify-between mb-1">
          <h2 className="text-lg font-semibold text-ink-100">{title}</h2>
          <button
            onClick={onClose}
            className="text-ink-500 hover:text-ink-100 hover:bg-base-700 rounded-lg p-1.5 transition-colors focus-ring"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {description && <p className="text-sm text-ink-500 mb-4">{description}</p>}
        <div className={description ? '' : 'mt-4'}>{children}</div>
      </div>
    </div>,
    document.body,
  )
}
