import { createClient } from '@/lib/supabase/client'

export const TASK_STATUSES = ['جاري', 'مكتمل', 'متأخر', 'قرارات مطلوبة'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export type Task = {
  id: string
  employeeName: string
  department: string
  taskTitle: string
  progress: number
  status: TaskStatus
  updatedAt: string
}

export type TaskInput = Omit<Task, 'id' | 'updatedAt'>

type TaskRow = {
  id: string
  employee_name: string
  department: string
  task_title: string
  progress: number
  status: TaskStatus
  updated_at: string
}

const COLUMNS = 'id, employee_name, department, task_title, progress, status, updated_at'

function fromRow(row: TaskRow): Task {
  return {
    id: row.id,
    employeeName: row.employee_name,
    department: row.department,
    taskTitle: row.task_title,
    progress: row.progress,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

function toRow(input: TaskInput) {
  return {
    employee_name: input.employeeName,
    department: input.department,
    task_title: input.taskTitle,
    progress: Math.min(100, Math.max(0, Math.round(input.progress))),
    status: input.status,
    updated_at: new Date().toISOString(),
  }
}

export const TASKS_KEY = 'tasks'

export async function fetchTasks(): Promise<Task[]> {
  const { data, error } = await createClient()
    .from('tasks')
    .select(COLUMNS)
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data as TaskRow[]).map(fromRow)
}

export async function createTask(input: TaskInput) {
  const { error } = await createClient().from('tasks').insert(toRow(input))
  if (error) throw error
}

export async function updateTask(id: string, input: TaskInput) {
  const { error } = await createClient().from('tasks').update(toRow(input)).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string) {
  const { error } = await createClient().from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function renameDepartment(oldName: string, newName: string) {
  const { error } = await createClient().rpc('rename_department', {
    old_name: oldName,
    new_name: newName,
  })
  if (error) throw error
}

export function getDepartments(tasks: Task[]) {
  return [...new Set(tasks.map((t) => t.department))].filter(Boolean)
}
