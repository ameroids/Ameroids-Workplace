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
      {/* Hero Banner */}
      <div className="relative w-full h-[220px] sm:h-[320px] rounded-2xl sm:rounded-[2rem] overflow-hidden mb-2 animate-fade-in shadow-[0_15px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        <div className="absolute inset-0">
          <img src="/overview-hero.jpg" alt="Interior View" className="w-full h-full object-cover object-[center_60%]" />
          {/* Overlay gradient for text readability - adapted for mobile and desktop */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-50/95 via-slate-50/80 to-transparent dark:from-[#050010]/95 dark:via-[#050010]/80 dark:to-transparent w-[85%] sm:w-[65%]" />
        </div>
        
        <div className="absolute inset-0 p-6 sm:p-12 flex items-center z-10">
          <div className="flex flex-col animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
            <span className="text-xs sm:text-sm font-medium text-ink-500 mb-1 sm:mb-2 tracking-wide uppercase">{formatDate(new Date().toISOString())}</span>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight text-ink-100 dark:text-white leading-[1.15]">
              {greeting()},<br/>
              <span className="text-violet-500 dark:text-violet-400 font-medium">Founders.</span>
            </h1>
            <p className="text-sm sm:text-base text-ink-500 mt-2 sm:mt-4 font-light max-w-[200px] sm:max-w-none">Here's your workspace at a glance.</p>
          </div>
        </div>
      </div>

      {/* Top row: High-level Project & Schedule Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
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
        <div className="lg:col-span-2 flex flex-col gap-6 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
          <div className="flex flex-col gap-3">
             <h2 className="text-sm font-medium text-ink-300 ml-1">Financial Overview</h2>
             <div className="card p-6 flex flex-col sm:flex-row items-center gap-8 hover:-translate-y-1 transition-all duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
               <div className="w-48 h-48 shrink-0 relative hover:scale-105 transition-transform duration-500">
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
                          contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
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
                  <div className="col-span-2 pb-2 border-b border-white/5 dark:border-white/10">
                    <div className="text-xs font-medium uppercase tracking-wider text-ink-500 mb-1">Total Received</div>
                    <div className="text-3xl font-light text-ink-100 dark:text-white tracking-tight">{formatINR(finance.totalReceived)}</div>
                  </div>
                  <div className="group">
                    <div className="text-sm text-ink-400 flex items-center gap-2 mb-1.5 font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] group-hover:scale-150 transition-transform" /> Available
                    </div>
                    <div className="text-xl font-light text-ink-100 dark:text-white">{formatINR(finance.availableBalance)}</div>
                  </div>
                  <div className="group">
                    <div className="text-sm text-ink-400 flex items-center gap-2 mb-1.5 font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] group-hover:scale-150 transition-transform" /> Spent
                    </div>
                    <div className="text-xl font-light text-ink-100 dark:text-white">{formatINR(finance.totalSpent)}</div>
                  </div>
                  <div className="group">
                    <div className="text-sm text-ink-400 flex items-center gap-2 mb-1.5 font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] group-hover:scale-150 transition-transform" /> Wajebat
                    </div>
                    <div className="text-xl font-light text-ink-100 dark:text-white">{formatINR(finance.totalWajebat)}</div>
                  </div>
               </div>
             </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between ml-1">
              <h2 className="text-sm font-medium text-ink-300">Needs attention</h2>
              <Link to="/projects" className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
                View projects <ArrowRight size={12} />
              </Link>
            </div>
            {loading ? (
              <div className="grid gap-3">
                <CardSkeleton />
              </div>
            ) : attention.length === 0 ? (
              <div className="card p-8 flex items-center justify-center border-dashed bg-white/5 dark:bg-white/5">
                <p className="text-sm text-ink-500 font-light text-center">Every active project is on track. You're all caught up.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {attention.map((p, index) => {
                  const days = daysUntil(p.due_date)
                  return (
                    <Link
                      key={p.id}
                      to={`/projects?open=${p.id}`}
                      className="card p-4 flex items-center gap-4 hover:-translate-y-1 hover:border-amber-500/30 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(245,158,11,0.1)] animate-slide-up"
                      style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}
                    >
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                        <AlertCircle size={16} strokeWidth={2.5} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-ink-100 dark:text-white truncate">{p.name}</span>
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
        <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between ml-1">
            <h2 className="text-sm font-medium text-ink-300">Recent activity</h2>
            <Link to="/activity" className="text-xs text-violet-500 hover:text-violet-400 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="card p-6 flex-1 hover:-translate-y-1 transition-transform duration-500 hover:shadow-[0_15px_40px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
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

