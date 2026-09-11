import React, { useEffect, useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import GlobalSearch from '../search/GlobalSearch'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="flex min-h-screen bg-base-950">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col">
        <Header onSearchOpen={() => setSearchOpen(true)} onMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
