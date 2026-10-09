import { useState, useEffect, useCallback } from 'react'
import { db, subscribeToChanges } from '../lib/db'
import type { Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    try {
      const data = await db.getTasks()
      setTasks(data)
    } catch (err) {
      console.error('Failed to load tasks', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
    const unsubscribe = subscribeToChanges(fetchTasks)
    return () => unsubscribe()
  }, [fetchTasks])

  const addTask = async (title: string) => {
    try {
      const task = await db.createTask({ title, completed: false })
      setTasks((prev) => [task, ...prev])
    } catch (err) {
      console.error('Failed to create task', err)
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)))
    
    try {
      await db.updateTask(id, { completed: !task.completed })
    } catch (err) {
      console.error('Failed to update task', err)
      // Revert on failure
      fetchTasks()
    }
  }

  const deleteTask = async (id: string) => {
    // Optimistic update
    setTasks((prev) => prev.filter((t) => t.id !== id))
    
    try {
      await db.deleteTask(id)
    } catch (err) {
      console.error('Failed to delete task', err)
      // Revert on failure
      fetchTasks()
    }
  }

  return { tasks, addTask, toggleTask, deleteTask, loading, refresh: fetchTasks }
}
