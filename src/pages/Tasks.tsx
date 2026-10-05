import React, { useState } from 'react'
import { Plus, ListTodo, CheckSquare, Square, Trash2 } from 'lucide-react'
import { useTasks } from '../hooks/useTasks'
import EmptyState from '../components/ui/EmptyState'

export default function Tasks() {
  const { tasks, addTask, toggleTask, deleteTask, loading } = useTasks()
  const [newTaskTitle, setNewTaskTitle] = useState('')

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return
    addTask(newTaskTitle.trim())
    setNewTaskTitle('')
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink-100">Tasks</h1>
          <p className="text-sm text-ink-500 mt-0.5">{activeTasks.length} pending · {completedTasks.length} completed</p>
        </div>
      </div>

      <div className="card p-4">
        <form onSubmit={handleAddTask} className="flex gap-3">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 bg-base-800 border border-base-600 rounded-lg px-4 py-2 text-sm text-ink-100 placeholder:text-ink-500 outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all"
          />
          <button
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors focus-ring shrink-0"
          >
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      {!loading && tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks yet"
          description="Create your first task above to get started."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {activeTasks.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-base-600/50 bg-base-800/30">
                <h2 className="text-sm font-medium text-ink-100">Pending</h2>
              </div>
              <div className="divide-y divide-base-600/50">
                {activeTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-base-800/30 transition-colors">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-ink-500 hover:text-violet-500 transition-colors shrink-0"
                    >
                      <Square size={20} />
                    </button>
                    <span className="flex-1 text-sm text-ink-100">{task.title}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-ink-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 p-1"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="card overflow-hidden opacity-70">
              <div className="px-4 py-3 border-b border-base-600/50 bg-base-800/30">
                <h2 className="text-sm font-medium text-ink-100">Completed</h2>
              </div>
              <div className="divide-y divide-base-600/50">
                {completedTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-base-800/30 transition-colors">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className="text-violet-500 hover:text-ink-500 transition-colors shrink-0"
                    >
                      <CheckSquare size={20} />
                    </button>
                    <span className="flex-1 text-sm text-ink-500 line-through">{task.title}</span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="text-ink-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 p-1"
                      title="Delete task"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
