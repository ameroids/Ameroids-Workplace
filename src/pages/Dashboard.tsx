import React from 'react'
import { FolderKanban, CheckCircle2, CalendarClock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useProjects } from '../hooks/useProjects'
import { useTransactions } from '../hooks/useTransactions'
import { useMeetings } from '../hooks/useMeetings'
import { useActivity } from '../hooks/useActivity'
import StatCard from '../components/ui/StatCard'
import { StatCardSkeleton, CardSkeleton } from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import ActivityTimeline from '../components/activity/ActivityTimeline'
import { StatusBadge } from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import { computeFinanceSummary, countActiveProjects, countCompletedProjects, getNextMeeting, projectsNeedingAttention } from '../lib/calculations'
import { formatDate, formatINR, daysUntil } from '../lib/format'

function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

const COLORS = ['#10b981', '#f43f5e', '#8b5cf6'] // emerald, rose, violet

export default function Dashboard() {
  const { projects, loading: loadingProjects } = useProjects()
  const { transactions, loading: loadingTx } = useTransactions()
  const { meetings, loading: loadingMeetings } = useMeetings()
  const { activity, loading: loadingActivity } = useActivity()

  const loading = loadingProjects || loadingTx || loadingMeetings
  const finance = computeFinanceSummary(transactions)
  const nextMeeting = getNextMeeting(meetings)
  const attention = projectsNeedingAttention(projects).slice(0, 4)

  const pieData = [
    { name: 'Available Balance', value: finance.availableBalance },
    { name: 'Total Spent', value: finance.totalSpent },
    { name: 'Wajebat', value: finance.totalWajebat },
  ].filter(d => d.value > 0)

  const hasData = pieData.length > 0
  const renderData = hasData ? pieData : [{ name: 'No data', value: 1 }]

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto px-2">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-light text-ink-50 tracking-tight flex items-center gap-2">
            {greeting()}, Founders <Sparkles size={20} className="text-amber-400" />
          </h1>
          <p className="text-sm text-ink-400 mt-1.5 font-light">Here's your executive workspace summary.</p>
        </div>
      </div>

      {/* Top row: High-level Project & Schedule Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <StatCard label="Active projects" value={String(countActiveProjects(projects))} icon={FolderKanban} />
            <StatCard label="Completed projects" value={String(countCompletedProjects(projects))} icon={CheckCircle2} tone="positive" />
            <StatCard
              label="Next meeting"
              value={nextMeeting ? formatDate(nextMeeting.date) : 'None scheduled'}
              icon={CalendarClock}
              hint={nextMeeting ? `${nextMeeting.title} · ${nextMeeting.time}` : undefined}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Financial Overview + Needs Attention */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
             <h2 className="text-sm font-medium text-ink-300">Financial Overview</h2>
             <div className="card p-6 flex flex-col sm:flex-row items-center gap-8 bg-base-900/40 backdrop-blur-sm border-base-700/50 hover:border-base-600/80 transition-colors">
               <div className="w-48 h-48 shrink-0 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={renderData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                      >
                        {renderData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={hasData ? COLORS[index % COLORS.length] : 'rgba(255,255,255,0.05)'} />
                        ))}
                      </Pie>
                      {hasData && (
                        <Tooltip 
                          formatter={(val: any) => formatINR(val as number)}
                          contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                          itemStyle={{ color: '#e2e8f0' }}
                        />
                      )}
                    </PieChart>
                  </ResponsiveContainer>
                  {!hasData && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-600 font-light">
                      No data
                    </div>
                  )}
               </div>
               
               <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-6 w-full">
                  <div className="col-span-2 pb-2 border-b border-base-800/50">
                    <div className="text-xs font-medium uppercase tracking-wider text-ink-500 mb-1">Total Received</div>
                    <div className="text-3xl font-light text-ink-50 tracking-tight">{formatINR(finance.totalReceived)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-ink-400 flex items-center gap-2 mb-1.5 font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Available
                    </div>
                    <div className="text-xl font-light text-ink-100">{formatINR(finance.availableBalance)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-ink-400 flex items-center gap-2 mb-1.5 font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" /> Spent
                    </div>
                    <div className="text-xl font-light text-ink-100">{formatINR(finance.totalSpent)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-ink-400 flex items-center gap-2 mb-1.5 font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" /> Wajebat
                    </div>
                    <div className="text-xl font-light text-ink-100">{formatINR(finance.totalWajebat)}</div>
                  </div>
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-ink-300">Needs attention</h2>
              <Link to="/projects" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
                View projects <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-3">
                <CardSkeleton />
              </div>
            ) : attention.length === 0 ? (
              <div className="card p-8 flex items-center justify-center border-dashed border-base-700/60 bg-base-900/20">
                <p className="text-sm text-ink-500 font-light text-center">Every active project is on track. You're all caught up.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {attention.map((p) => {
                  const days = daysUntil(p.due_date)
                  return (
                    <Link
                      key={p.id}
                      to={`/projects?open=${p.id}`}
                      className="card p-4 flex items-center gap-4 border-base-700/50 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all"
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                        <AlertCircle size={16} strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-ink-100 truncate">{p.name}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="w-24">
                            <ProgressBar value={p.progress} size="sm" />
                          </div>
                          <span className="text-xs text-ink-500 font-light">
                            {p.status === 'On Hold' ? 'On hold' : days !== null && days < 0 ? `${Math.abs(days)}d overdue` : `Due in ${days}d`}
                          </span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Feed */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-ink-300">Recent activity</h2>
            <Link to="/activity" className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card p-6 flex-1 bg-base-900/20 border-base-700/50">
            {loadingActivity ? (
              <div className="flex flex-col gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : activity.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center">
                <p className="text-sm text-ink-500 font-light">No activity recorded yet.</p>
              </div>
            ) : (
              <ActivityTimeline activity={activity.slice(0, 8)} compact />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

