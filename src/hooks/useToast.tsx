import React, { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

type ToastVariant = 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const showToast = useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = crypto.randomUUID()
    setToasts((t) => [...t, { id, message, variant }])
    setTimeout(() => {
      setToasts((t) => t.filter((x) => x.id !== id))
    }, 3600)
  }, [])

  const dismiss = (id: string) => setToasts((t) => t.filter((x) => x.id !== id))

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 w-[320px]">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="animate-slide-up card flex items-start gap-2.5 px-4 py-3 shadow-glow"
          >
            {toast.variant === 'success' && <CheckCircle2 size={18} className="text-emerald-400 mt-0.5 shrink-0" />}
            {toast.variant === 'error' && <XCircle size={18} className="text-rose-400 mt-0.5 shrink-0" />}
            {toast.variant === 'info' && <Info size={18} className="text-violet-400 mt-0.5 shrink-0" />}
            <p className="text-sm text-ink-200 leading-snug flex-1">{toast.message}</p>
            <button onClick={() => dismiss(toast.id)} className="text-ink-500 hover:text-ink-200 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
