import React, { useState, useRef, useEffect } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Transaction } from '../../types'
import { TransactionTypeBadge } from '../ui/Badge'
import { formatDate, formatINR } from '../../lib/format'

function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen((o) => !o)} className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:text-ink-100 hover:bg-base-800 transition-colors focus-ring">
        <MoreHorizontal size={16} />
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-36 card p-1.5 z-20 animate-scale-in origin-top-right shadow-lg">
          <button onClick={() => { onEdit(); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-ink-200 hover:text-ink-50 hover:bg-base-800 rounded-md transition-colors">
            <Pencil size={14} /> Edit
          </button>
          <button onClick={() => { onDelete(); setOpen(false) }} className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

function amountColor(t: Transaction) {
  if (t.type === 'Received') return 'text-emerald-500 dark:text-emerald-400'
  if (t.type === 'Spent') return 'text-rose-500 dark:text-rose-400'
  return 'text-violet-500 dark:text-violet-400'
}
function amountSign(t: Transaction) {
  return t.type === 'Received' ? '+' : '-'
}

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[]
  onEdit: (t: Transaction) => void
  onDelete: (t: Transaction) => void
}) {
  return (
    <>
      <div className="hidden md:block rounded-2xl bg-base-900/30 border border-base-700/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-700/50 text-left text-xs uppercase tracking-wider text-ink-500 bg-base-900/40">
                <th className="py-4 px-6 font-medium">Date</th>
                <th className="py-4 px-6 font-medium">Description</th>
                <th className="py-4 px-6 font-medium">Category</th>
                <th className="py-4 px-6 font-medium">Type</th>
                <th className="py-4 px-6 font-medium text-right">Amount</th>
                <th className="py-4 px-6 font-medium">Notes</th>
                <th className="py-4 px-6 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-base-700/30 last:border-0 hover:bg-base-800/40 transition-colors group">
                  <td className="py-4 px-6 text-ink-400 whitespace-nowrap font-light">{formatDate(t.date)}</td>
                  <td className="py-4 px-6 text-ink-100 font-medium">{t.description}</td>
                  <td className="py-4 px-6 text-ink-400 font-light">{t.category}</td>
                  <td className="py-4 px-6">
                    <TransactionTypeBadge type={t.type} />
                  </td>
                  <td className={`py-4 px-6 text-right tabular font-medium ${amountColor(t)}`}>
                    {amountSign(t)}{formatINR(t.amount)}
                  </td>
                  <td className="py-4 px-6 text-ink-500 text-xs max-w-[200px] truncate font-light">{t.notes || '—'}</td>
                  <td className="py-4 px-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <RowMenu onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {transactions.map((t) => (
          <div key={t.id} className="rounded-xl p-5 flex flex-col gap-3 bg-base-900/40 border border-base-700/50 backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base text-ink-100 font-medium">{t.description}</div>
                <div className="text-xs text-ink-500 mt-1 font-light">{formatDate(t.date)} · {t.category}</div>
              </div>
              <RowMenu onEdit={() => onEdit(t)} onDelete={() => onDelete(t)} />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-base-700/30">
              <TransactionTypeBadge type={t.type} />
              <span className={`text-lg tabular font-medium ${amountColor(t)}`}>{amountSign(t)}{formatINR(t.amount)}</span>
            </div>
            {t.notes && <p className="text-sm text-ink-400 font-light mt-1">{t.notes}</p>}
          </div>
        ))}
      </div>
    </>
  )
}
