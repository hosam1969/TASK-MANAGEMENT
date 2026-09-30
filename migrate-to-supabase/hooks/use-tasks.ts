'use client'

import { useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { fetchTasks, TASKS_KEY } from '@/lib/tasks'

export function useTasks() {
  const swr = useSWR(TASKS_KEY, fetchTasks)
  const { mutate } = swr

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('tasks-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        mutate()
      })
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [mutate])

  return swr
}
