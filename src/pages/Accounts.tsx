import React, { useMemo, useState } from 'react'
import { Plus, Wallet, TrendingDown, HandCoins, PiggyBank, Filter, Sparkles } from 'lucide-react'
import { useTransactions } from '../hooks/useTransactions'
import StatCard from '../components/ui/StatCard'
import { StatCardSkeleton } from '../components/ui/Skeleton'
import TransactionTable from '../components/accounts/TransactionTable'
import TransactionFormModal from '../components/accounts/TransactionFormModal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import { computeFinanceSummary } from '../lib/calculations'
import { formatINR } from '../lib/format'
import type { Transaction, TransactionType } from '../types'
import { db } from '../lib/db'
import { useToast } from '../hooks/useToast'

const filters: (TransactionType | 'All')[] = ['All', 'Received', 'Spent', 'Wajebat']

export default function Accounts() {
  const { transactions, loading, refresh } = useTransactions()
  const [filter, setFilter] = useState<(typeof filters)[number]>('All')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<Transaction | null>(null)
  const { showToast } = useToast()

  const finance = computeFinanceSummary(transactions)
  const filtered = useMemo(
    () => (filter === 'All' ? transactions : transactions.filter((t) => t.type === filter)),
    [transactions, filter],
  )

  const handleDelete = async () => {
    if (!deleting) return
    try {
      await db.deleteTransaction(deleting.id)
      showToast('Transaction deleted')
      refresh()
    } catch {
      showToast('Unable to delete transaction', 'error')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto px-2">
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:justify-between">
        <div>
          <h1 className="text-3xl font-light text-ink-50 tracking-tight flex items-center gap-2">
            Accounts <Sparkles size={20} className="text-violet-400" />
          </h1>
          <p className="text-sm text-ink-400 mt-1.5 font-light">Ameroids' internal money tracker.</p>
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setFormOpen(true)
          }}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all shadow-md shadow-violet-500/20 hover:shadow-violet-500/40 focus-ring shrink-0"
        >
          <Plus size={16} strokeWidth={2.5} /> Add transaction
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Total received" value={formatINR(finance.totalReceived)} icon={Wallet} tone="positive" />
            <StatCard label="Total spent" value={formatINR(finance.totalSpent)} icon={TrendingDown} />
            <StatCard label="Total Wajebat" value={formatINR(finance.totalWajebat)} icon={HandCoins} />
            <StatCard label="Available balance" value={formatINR(finance.availableBalance)} icon={PiggyBank} tone="positive" />
          </>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mb-1">
          <div className="p-1.5 rounded-lg bg-base-800/40 border border-base-700/50 flex items-center shrink-0 text-ink-400">
            <Filter size={14} />
          </div>
          <div className="flex items-center p-1 rounded-xl bg-base-900/40 border border-base-700/50 backdrop-blur-sm shadow-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  filter === f
                    ? 'bg-white dark:bg-base-700 text-ink-100 shadow-sm'
                    : 'text-ink-400 hover:text-ink-200 hover:bg-base-800/40'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {!loading && filtered.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title={transactions.length === 0 ? 'No transactions recorded' : 'No transactions match this filter'}
            description={transactions.length === 0 ? 'Add your first transaction to start tracking Ameroids finances.' : 'Try a different filter.'}
            action={
              transactions.length === 0 ? (
                <button onClick={() => setFormOpen(true)} className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors focus-ring">
                  Add transaction
                </button>
              ) : undefined
            }
          />
        ) : (
          <TransactionTable transactions={filtered} onEdit={(t) => { setEditing(t); setFormOpen(true) }} onDelete={setDeleting} />
        )}
      </div>

      <TransactionFormModal open={formOpen} onClose={() => setFormOpen(false)} transaction={editing} onSaved={refresh} />

      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction"
        description={`This will permanently remove "${deleting?.description}" from your records.`}
        confirmLabel="Delete transaction"
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  )
}
