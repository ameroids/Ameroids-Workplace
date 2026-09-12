import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutGrid, FolderKanban, Wallet, CalendarClock, Activity, Settings, ChevronsLeft, LogOut } from 'lucide-react'
import { initials } from '../../lib/format'
import { backendMode } from '../../lib/db'

const navItems = [
  { to: '/', label: 'Overview', icon: LayoutGrid, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/accounts', label: 'Accounts', icon: Wallet },
  { to: '/meetings', label: 'Meetings', icon: CalendarClock },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/settings', label: 'Settings', icon: Settings },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    window.location.reload()
  }

  const content = (
    <div className="flex flex-col h-full">
      <div className={`flex items-center gap-2.5 px-4 h-16 border-b border-black/5 dark:border-white/5 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Ameroids Logo" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink-100 tracking-tight">Ameroids</div>
            <div className="text-[11px] text-ink-500">Workplace</div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="ml-auto hidden lg:flex text-ink-500 hover:text-ink-100 transition-colors p-1 rounded-md hover:bg-base-700"
          aria-label="Collapse sidebar"
        >
          <ChevronsLeft size={15} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm transition-colors relative ${
                isActive ? 'bg-violet-500/10 text-violet-600 dark:text-violet-300' : 'text-ink-400 hover:text-ink-100 hover:bg-base-800'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-violet-400" />}
                <item.icon size={17} strokeWidth={2} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-2.5 border-t border-black/5 dark:border-white/5">
        <button
          onClick={handleLogout}
          className={`group flex items-center gap-3 w-full px-2.5 py-2 rounded-lg text-sm transition-colors text-ink-400 hover:text-red-400 hover:bg-red-400/10 ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut size={17} strokeWidth={2} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white/30 dark:bg-black/30 backdrop-blur-2xl border-r border-black/5 dark:border-white/5 shadow-[2px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[2px_0_15px_rgba(0,0,0,0.5)] h-full transition-all duration-300 relative z-20 ${
          collapsed ? 'w-[72px]' : 'w-[240px]'
        }`}
      >
        {content}
      </aside>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onCloseMobile} />
          <aside className="relative w-[260px] h-full bg-white/70 dark:bg-[#0a0510]/80 backdrop-blur-3xl border-r border-black/10 dark:border-white/10 shadow-2xl animate-slide-in-right" style={{ animationName: 'slide-up' }}>
            {content}
          </aside>
        </div>
      )}
    </>
  )
}
