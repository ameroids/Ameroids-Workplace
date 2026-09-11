import type { Project, Transaction, Meeting } from '../types'

export function sumByType(transactions: Transaction[], type: Transaction['type']): number {
  return transactions.filter((t) => t.type === type).reduce((sum, t) => sum + t.amount, 0)
}

export interface FinanceSummary {
  totalReceived: number
  totalSpent: number
  totalWajebat: number
  availableBalance: number
}

export function computeFinanceSummary(transactions: Transaction[]): FinanceSummary {
  const totalReceived = sumByType(transactions, 'Received')
  const totalSpent = sumByType(transactions, 'Spent')
  const totalWajebat = sumByType(transactions, 'Wajebat')
  return {
    totalReceived,
    totalSpent,
    totalWajebat,
    availableBalance: totalReceived - totalSpent - totalWajebat,
  }
}

export function countActiveProjects(projects: Project[]): number {
  return projects.filter((p) => p.status !== 'Completed').length
}

export function countCompletedProjects(projects: Project[]): number {
  return projects.filter((p) => p.status === 'Completed').length
}

export function projectsNeedingAttention(projects: Project[]): Project[] {
  const now = new Date()
  return projects.filter((p) => {
    if (p.status === 'Completed') return false
    if (p.status === 'On Hold') return true
    if (!p.due_date) return false
    const days = Math.round((new Date(p.due_date).getTime() - now.getTime()) / 86400000)
    return days <= 5
  })
}

export function getNextMeeting(meetings: Meeting[]): Meeting | undefined {
  const now = Date.now()
  return meetings
    .filter((m) => m.status === 'Upcoming' && new Date(`${m.date}T${m.time || '00:00'}`).getTime() >= now)
    .sort((a, b) => new Date(`${a.date}T${a.time || '00:00'}`).getTime() - new Date(`${b.date}T${b.time || '00:00'}`).getTime())[0]
}
