import { useState, useEffect } from 'react'

export interface Task {
  id: string
  title: string
  completed: boolean
  createdAt: string
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('ameroids_tasks')
    if (stored) {
      try {
        setTasks(JSON.parse(stored))
      } catch (e) {
        // Ignored
      }
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('ameroids_tasks', JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const addTask = (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    }
    setTasks(prev => [newTask, ...prev])
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  return { tasks, addTask, toggleTask, deleteTask, loading }
}
