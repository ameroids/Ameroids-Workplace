import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import Accounts from './pages/Accounts'
import Meetings from './pages/Meetings'
import Activity from './pages/Activity'
import Settings from './pages/Settings'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/meetings" element={<Meetings />} />
        <Route path="/activity" element={<Activity />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </AppShell>
  )
}
