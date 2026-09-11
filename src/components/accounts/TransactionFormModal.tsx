import React, { useEffect, useState } from 'react'
import Modal from '../ui/Modal'
import { Field, inputClass, selectClass, textareaClass } from '../ui/Field'
import type { Transaction, TransactionType } from '../../types'
import { db } from '../../lib/db'
import { useToast } from '../../hooks/useToast'

const types: TransactionType[] = ['Received', 'Spent', 'Wajebat']

const categoriesByType: Record<TransactionType, string[]> = {
  Received: ['Client payment', 'Project milestone', 'Advance', 'Final payment', 'Other income'],
  Spent: ['Domain', 'Hosting', 'Software', 'Advertising', 'Development expenses', 'Other expenses'],
  Wajebat: ['Wajebat'],
}

interface FormState {
  type: TransactionType
  amount: string
  description: string
  category: string
  date: string
  notes: string
}

const today = () => new Date().toISOString().slice(0, 10)

const empty: FormState = { type: 'Received', amount: '', description: '', category: 'Client payment', date: today(), notes: '' }

export default function TransactionFormModal({
  open,
  onClose,
  transaction,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  transaction: Transaction | null
  onSaved: () => void
}) {
  const [form, setForm] = useState<FormState>(empty)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const isEdit = Boolean(transaction)

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type,
        amount: String(transaction.amount),
        description: transaction.description,
        category: transaction.category,
        date: transaction.date,
        notes: transaction.notes,
      })
    } else {
      setForm(empty)
    }
  }, [transaction, open])

  const update = (patch: Partial<FormState>) => setForm((f) => ({ ...f, ...patch }))

  const handleTypeChange = (type: TransactionType) => {
    update({ type, category: categoriesByType[type][0] })
  }

  const handleSubmit = async () => {
    const amount = Number(form.amount)
    if (!form.description.trim() || !amount || amount <= 0) {
      showToast('Enter a description and a valid amount', 'error')
      return
    }
    setSaving(true)
    try {
      if (isEdit && transaction) {
        await db.updateTransaction(transaction.id, {
          type: form.type,
          amount,
          description: form.description,
          category: form.category,
          date: form.date,
          notes: form.notes,
        })
        showToast('Transaction saved')
      } else {
        await db.createTransaction({
          type: form.type,
          amount,
          description: form.description,
          category: form.category,
          date: form.date,
          notes: form.notes,
        })
        showToast('Transaction saved')
      }
      onSaved()
      onClose()
    } catch {
      showToast('Unable to save changes', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit transaction' : 'Add transaction'} width="md">
      <div className="flex flex-col gap-4">
        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {types.map((t) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={`py-2 rounded-lg text-sm border transition-colors ${
                  form.type === t ? 'bg-violet-500/15 border-violet-500/40 text-violet-300' : 'bg-base-800 border-base-600 text-ink-400 hover:text-ink-100'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount (₹)">
            <input type="number" min={0} className={inputClass} value={form.amount} onChange={(e) => update({ amount: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Date">
            <input type="date" className={inputClass} value={form.date} onChange={(e) => update({ date: e.target.value })} />
          </Field>
        </div>

        <Field label="Description">
          <input className={inputClass} value={form.description} onChange={(e) => update({ description: e.target.value })} placeholder="e.g. CrochetMart milestone payment" />
        </Field>

        <Field label="Category">
          <select className={selectClass} value={form.category} onChange={(e) => update({ category: e.target.value })}>
            {categoriesByType[form.type].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <Field label="Notes" hint="Optional">
          <textarea className={textareaClass} value={form.notes} onChange={(e) => update({ notes: e.target.value })} placeholder="Any extra context…" />
        </Field>

        <div className="flex items-center justify-end gap-3 mt-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-ink-300 hover:bg-base-700 transition-colors focus-ring">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white transition-colors disabled:opacity-50 focus-ring"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </div>
    </Modal>
  )
}
