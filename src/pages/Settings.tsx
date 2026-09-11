import React, { useEffect, useState } from 'react'
import { Database, Bell, Palette, Coins, RotateCcw, CheckCircle2, AlertTriangle, Globe } from 'lucide-react'
import { db, backendMode } from '../lib/db'
import { useToast } from '../hooks/useToast'
import type { WorkspaceSettings } from '../types'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { inputClass } from '../components/ui/Field'

export default function Settings() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null)
  const [resetOpen, setResetOpen] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    db.getSettings().then(setSettings)
  }, [])

  const save = async (patch: Partial<WorkspaceSettings>) => {
    const updated = await db.updateSettings(patch)
    setSettings(updated)
    showToast('Settings saved')
  }

  const handleReset = () => {
    db.resetDemoData()
    showToast('Demo data has been reset')
    setResetOpen(false)
    setTimeout(() => window.location.reload(), 400)
  }

  if (!settings) return null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-semibold text-ink-100">Settings</h1>
        <p className="text-sm text-ink-500 mt-0.5">Manage your workspace preferences.</p>
      </div>

      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-200">
          <Palette size={15} className="text-violet-400" /> Workspace
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center shrink-0 shadow-glow">
            <span className="text-white text-sm font-bold">A</span>
          </div>
          <div>
            <div className="text-sm text-ink-200 font-medium">Ameroids</div>
            <div className="text-xs text-ink-500">Workspace logo</div>
          </div>
        </div>
        <label className="flex flex-col gap-1.5 max-w-xs">
          <span className="text-xs font-medium text-ink-400">Workspace name</span>
          <input
            className={inputClass}
            value={settings.workspace_name}
            onChange={(e) => setSettings({ ...settings, workspace_name: e.target.value })}
            onBlur={(e) => save({ workspace_name: e.target.value })}
          />
        </label>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          Theme: <span className="text-ink-300">Matches your preference</span>
        </div>
      </section>

      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-200">
          <Globe size={15} className="text-violet-400" /> Localization
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-400">Time zone</span>
            <select
              className={inputClass}
              value={settings.time_zone}
              onChange={(e) => save({ time_zone: e.target.value })}
            >
              <option value="Asia/Kolkata">India Standard Time (IST)</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="Europe/London">Greenwich Mean Time (GMT)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-400">Date format</span>
            <select
              className={inputClass}
              value={settings.date_format}
              onChange={(e) => save({ date_format: e.target.value })}
            >
              <option value="DD MMM YYYY">DD MMM YYYY (e.g. 10 Sept 2026)</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 09/10/2026)</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 10/09/2026)</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-09-10)</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-200">
          <Coins size={15} className="text-violet-400" /> Currency
        </div>
        <p className="text-sm text-ink-400">All amounts across Ameroids Command Center are shown in Indian Rupees (₹ / INR).</p>
      </section>

      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-200">
          <Bell size={15} className="text-violet-400" /> Notifications
        </div>
        <label className="flex items-center justify-between">
          <span className="text-sm text-ink-300">Deadline, meeting and update alerts</span>
          <button
            onClick={() => save({ notifications_enabled: !settings.notifications_enabled })}
            className={`w-11 h-6 rounded-full transition-colors relative ${settings.notifications_enabled ? 'bg-violet-600' : 'bg-base-600'}`}
          >
            <span
              className={`absolute top-0.5 left-0 w-5 h-5 rounded-full bg-white transition-transform ${
                settings.notifications_enabled ? 'translate-x-5.5 lg:translate-x-[22px]' : 'translate-x-0.5 lg:translate-x-[2px]'
              }`}
              style={{ transform: settings.notifications_enabled ? 'translateX(22px)' : 'translateX(2px)' }}
            />
          </button>
        </label>
      </section>

      <section className="card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm font-medium text-ink-200">
          <Database size={15} className="text-violet-400" /> Data connection
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          {backendMode === 'appwrite' ? (
            <>
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span className="text-ink-300">Connected to Appwrite</span>
            </>
          ) : (
            <>
              <AlertTriangle size={15} className="text-amber-400" />
              <span className="text-ink-300">Running in demo mode — data is stored locally in this browser</span>
            </>
          )}
        </div>
        <p className="text-xs text-ink-500 leading-relaxed">
          To connect Appwrite, set <code className="text-violet-300">VITE_APPWRITE_ENDPOINT</code>, <code className="text-violet-300">VITE_APPWRITE_PROJECT_ID</code>, and{' '}
          <code className="text-violet-300">VITE_APPWRITE_DATABASE_ID</code> in your <code className="text-violet-300">.env</code> file and restart the dev server.
          See the README for full setup instructions.
        </p>
        {backendMode === 'local' && (
          <button
            onClick={() => setResetOpen(true)}
            className="self-start flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-base-800 border border-base-600 text-ink-300 hover:text-ink-100 hover:border-base-500 transition-colors focus-ring"
          >
            <RotateCcw size={13} /> Reset demo data
          </button>
        )}
      </section>

      <ConfirmDialog
        open={resetOpen}
        title="Reset demo data"
        description="This restores the original sample projects, transactions and meetings, discarding any local changes you've made."
        confirmLabel="Reset data"
        onConfirm={handleReset}
        onCancel={() => setResetOpen(false)}
        danger
      />
    </div>
  )
}
