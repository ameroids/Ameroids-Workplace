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
    <div className="flex h-screen bg-slate-50 dark:bg-[#050010] relative overflow-hidden transition-colors duration-700 font-sans">
      
      {/* Global Vibrant Aurora Background Animations */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(255,120,50,0.4)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(255,100,50,0.25)_0%,transparent_60%)] animate-[float_20s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(150,50,255,0.3)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(100,50,255,0.2)_0%,transparent_60%)] animate-[float_25s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(255,50,150,0.2)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(200,50,150,0.15)_0%,transparent_60%)] animate-[float_22s_ease-in-out_infinite]" style={{ animationDelay: '-5s' }} />
        
        {/* Subtle grid mesh overlay for texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30 dark:opacity-20 mix-blend-overlay dark:mix-blend-color-dodge animate-[pulse_6s_ease-in-out_infinite]" />
        
        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(3%, -3%) scale(1.05); }
            66% { transform: translate(-3%, 3%) scale(0.95); }
          }
        `}</style>
      </div>

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex-1 min-w-0 flex flex-col relative z-10 overflow-y-auto">
        <Header onSearchOpen={() => setSearchOpen(true)} onMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 sm:px-6 py-8 max-w-[1400px] w-full mx-auto">{children}</main>
      </div>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
