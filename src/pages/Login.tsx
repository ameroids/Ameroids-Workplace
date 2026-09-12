import React, { useState, useEffect } from 'react'
import { User, Lock, Sun, Moon } from 'lucide-react'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored) return stored === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
  })

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [isDark])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'founders' && password === 'ameroids@founders') {
      localStorage.setItem('auth_token', 'true')
      onLogin()
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050010] flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-700">
      
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="absolute top-6 right-6 z-50 p-2.5 rounded-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 text-slate-700 dark:text-white/60 hover:text-black dark:hover:text-white shadow-lg backdrop-blur-md transition-all hover:scale-105 active:scale-95"
        title="Toggle Theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Vibrant Aurora Background Animations */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Orbs */}
        <div className="absolute top-[-15%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(255,120,50,0.5)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(255,100,50,0.4)_0%,transparent_60%)] animate-[float_15s_ease-in-out_infinite]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[70vw] h-[70vw] rounded-full bg-[radial-gradient(circle,rgba(150,50,255,0.4)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(100,50,255,0.4)_0%,transparent_60%)] animate-[float_20s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[25%] left-[15%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(255,50,150,0.3)_0%,transparent_60%)] dark:bg-[radial-gradient(circle,rgba(200,50,150,0.3)_0%,transparent_60%)] animate-[float_18s_ease-in-out_infinite]" style={{ animationDelay: '-5s' }} />
        
        {/* Subtle grid mesh overlay for texture */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-30 dark:opacity-20 mix-blend-overlay dark:mix-blend-color-dodge animate-[pulse_4s_ease-in-out_infinite]" />
        
        {/* Vignette */}
        <div className="absolute inset-0 shadow-[inset_0_0_100px_50px_rgba(255,255,255,0.5)] dark:shadow-[inset_0_0_100px_50px_rgba(0,0,0,0.8)]" />

        <style>{`
          @keyframes float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(6%, -6%) scale(1.08); }
            66% { transform: translate(-6%, 6%) scale(0.92); }
          }
        `}</style>
      </div>

      {/* The Perfectly Aligned Circular Glass Card */}
      <div 
        className="relative z-10 w-[420px] h-[420px] sm:w-[500px] sm:h-[500px] rounded-full flex flex-col items-center justify-center p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.7)] backdrop-blur-2xl animate-fade-in border border-white/50 dark:border-white/10"
        style={{
          background: isDark 
            ? 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)'
            : 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%)',
          animationDuration: '1s'
        }}
      >
        <div className="flex flex-col items-center mb-8 w-full">
          <div className="p-2.5 bg-white/40 dark:bg-black/30 rounded-2xl border border-black/5 dark:border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.05)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] mb-4 animate-scale-in">
            <img src="/logo.png" alt="Ameroids Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-slate-800 dark:text-white/90 text-2xl font-light tracking-[0.2em] text-center">
            LOGIN
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col w-full max-w-[300px] sm:max-w-[320px] gap-6 relative">
          {error && (
            <div className="text-xs text-red-600 dark:text-red-300 bg-red-100/80 dark:bg-red-900/40 p-2 rounded-lg text-center border border-red-500/30 absolute -top-12 left-0 right-0 animate-fade-in backdrop-blur-md">
              {error}
            </div>
          )}

          {/* Username Input */}
          <div className="relative group">
            <input
              type="text"
              className="w-full bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 outline-none focus:bg-white/80 dark:focus:bg-white/10 focus:border-black/20 dark:focus:border-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
            />
            <User size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition-colors" />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <input
              type="password"
              className="w-full bg-white/60 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/50 outline-none focus:bg-white/80 dark:focus:bg-white/10 focus:border-black/20 dark:focus:border-white/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] tracking-widest"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
            <Lock size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/50 group-focus-within:text-slate-700 dark:group-focus-within:text-white transition-colors" />
          </div>

          {/* Login Button */}
          <div className="flex justify-center mt-3">
            <button
              type="submit"
              className="px-10 py-3 rounded-full text-sm font-semibold text-slate-800 dark:text-white/90 bg-white/60 dark:bg-gradient-to-r dark:from-white/10 dark:to-white/5 border border-black/10 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/20 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/30 transition-all duration-300 shadow-md dark:shadow-lg dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 tracking-[0.1em]"
            >
              LOGIN
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
