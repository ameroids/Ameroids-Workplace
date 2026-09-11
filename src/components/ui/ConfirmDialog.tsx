import React from 'react'
import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
}

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  onConfirm,
  onCancel,
  danger = true,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onCancel} title={title} width="sm">
      <div className="flex gap-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${danger ? 'bg-rose-500/10 text-rose-400' : 'bg-violet-500/10 text-violet-400'}`}>
          <AlertTriangle size={16} />
        </div>
        <p className="text-sm text-ink-400 leading-relaxed">{description}</p>
      </div>
      <div className="flex items-center justify-end gap-3 mt-6">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-ink-300 hover:bg-base-700 transition-colors focus-ring">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
            danger ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-violet-600 hover:bg-violet-500 text-white'
          }`}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
