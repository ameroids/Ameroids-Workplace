import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Search, Menu, Sun, Moon } from 'lucide-react'
import NotificationsDropdown from '../notifications/NotificationsDropdown'
import { initials } from '../../lib/format'

const titleMap: Record<string, string> = {
  '/': 'Overview',
  '/projects': 'Projects',
  '/accounts': 'Accounts',
  '/meetings': 'Meetings',
  '/activity': 'Activity',
  '/settings': 'Settings',
}

export default function Header({ onSearchOpen, onMobileMenu }: { onSearchOpen: () => void; onMobileMenu: () => void }) {
  const location = useLocation()
  const title = titleMap[location.pathname] ?? 'Ameroids'

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return document.documentElement.classList.contains('dark') || document.documentElement.style.colorScheme === 'dark' || document.documentElement.className === ''
  })

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
    if (isDark) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center gap-3 px-4 sm:px-6 border-b border-base-700/80 bg-base-950/80 backdrop-blur-md">
      <button
        onClick={onMobileMenu}
        className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-400 hover:bg-base-800 transition-colors focus-ring"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-ink-500 hidden sm:inline">Ameroids</span>
        <span className="text-ink-600 hidden sm:inline">/</span>
        <span className="text-ink-100 font-medium truncate">{title}</span>
      </div>

      <div className="flex-1" />

      <button
        onClick={onSearchOpen}
        className="hidden sm:flex items-center gap-2 w-64 px-3 py-2 rounded-lg border border-base-600 bg-base-800/60 text-ink-500 text-sm hover:border-base-500 transition-colors focus-ring"
      >
        <Search size={14} />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="text-[10px] border border-base-600 rounded px-1.5 py-0.5">⌘K</kbd>
      </button>
      <button
        onClick={onSearchOpen}
        className="sm:hidden w-9 h-9 rounded-lg flex items-center justify-center text-ink-400 hover:bg-base-800 transition-colors focus-ring"
        aria-label="Search"
      >
        <Search size={17} />
      </button>

      <div className="relative hidden sm:flex items-center p-1 rounded-full bg-base-800/60 border border-base-700/50">
        <div
          className={`absolute top-1 bottom-1 w-[28px] rounded-full bg-base-600/20 shadow-sm transition-transform duration-300 ease-out ${
            isDark ? 'translate-x-[28px]' : 'translate-x-0'
          }`}
        />
        <button
          onClick={() => setIsDark(false)}
          className={`relative z-10 w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors ${
            !isDark ? 'text-violet-500' : 'text-ink-500 hover:text-ink-300'
          }`}
          aria-label="Light mode"
        >
          <Sun size={15} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => setIsDark(true)}
          className={`relative z-10 w-[28px] h-[28px] flex items-center justify-center rounded-full transition-colors ${
            isDark ? 'text-violet-400' : 'text-ink-500 hover:text-ink-300'
          }`}
          aria-label="Dark mode"
        >
          <Moon size={15} strokeWidth={2.5} />
        </button>
      </div>

      <NotificationsDropdown />

      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0">
        <img src="/logo.png" alt="Ameroids" className="w-full h-full object-contain" />
      </div>
    </header>
  )
}
