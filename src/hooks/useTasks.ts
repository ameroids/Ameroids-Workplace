import { useState, useEffect } from 'react'
import { supabase, isSupabaseConfigured } from '../supabase/config'

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
    async function fetchTasks() {
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('createdAt', { ascending: false })
          
          if (error) throw error
          if (data) {
            // map snake_case to camelCase if needed, assuming the DB has same columns or similar
            const formatted = data.map(t => ({
              id: t.id,
              title: t.title,
              completed: t.completed,
              createdAt: t.createdAt || t.created_at
            }))
            setTasks(formatted)
          }
        } catch (e) {
          console.error('Error fetching tasks:', e)
          fallbackToLocal()
        } finally {
          setLoading(false)
        }
      } else {
        fallbackToLocal()
        setLoading(false)
      }
    }

    function fallbackToLocal() {
      const stored = localStorage.getItem('ameroids_tasks')
      if (stored) {
        try {
          setTasks(JSON.parse(stored))
        } catch (e) {
          // Ignored
        }
      }
    }

    fetchTasks()
  }, [])

  // Sync to local storage only if Supabase is not configured
  useEffect(() => {
    if (!loading && !isSupabaseConfigured) {
      localStorage.setItem('ameroids_tasks', JSON.stringify(tasks))
    }
  }, [tasks, loading])

  const addTask = async (title: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    }
    
    // Optimistic update
    setTasks(prev => [newTask, ...prev])

    if (isSupabaseConfigured) {
      try {
        const dbTask = {
          id: newTask.id,
          title: newTask.title,
          completed: newTask.completed,
          created_at: newTask.createdAt
        }
        await supabase.from('tasks').insert([dbTask])
      } catch (e) {
        console.error('Error adding task:', e)
      }
    }
  }

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id)
    if (!task) return

    const newCompletedState = !task.completed
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: newCompletedState } : t))

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('tasks')
          .update({ completed: newCompletedState })
          .eq('id', id)
      } catch (e) {
        console.error('Error toggling task:', e)
      }
    }
  }

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))

    if (isSupabaseConfigured) {
      try {
        await supabase.from('tasks').delete().eq('id', id)
      } catch (e) {
        console.error('Error deleting task:', e)
      }
    }
  }

  return { tasks, addTask, toggleTask, deleteTask, loading }
}
