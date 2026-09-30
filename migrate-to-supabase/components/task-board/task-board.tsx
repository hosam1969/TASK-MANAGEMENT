'use client'

import { useCallback, useRef, useState } from 'react'
import { User } from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks'
import {
  createTask,
  deleteTask,
  getDepartments,
  renameDepartment,
  updateTask,
  type Task,
  type TaskInput,
  type TaskStatus,
} from '@/lib/tasks'
import { AppHeader, type View } from './app-header'
import { DepartmentRename } from './department-rename'
import { DetailModal } from './detail-modal'
import { EmployeeTasksTable } from './employee-tasks-table'
import { ManagerView } from './manager-view'
import { TaskForm } from './task-form'
import { Toast, type ToastState } from './toast'
import { UsersPanel } from './users-panel'
import type { Profile } from '@/lib/auth'

type Props = { profile: Profile; users: Profile[] }

export function TaskBoard({ profile, users }: Props) {
  const isManager = profile.role === 'manager'
  const { data: tasks = [], error, isLoading, isValidating, mutate } = useTasks()
  const [view, setView] = useState<View>(isManager ? 'manager' : 'employee')
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modal, setModal] = useState<{ title: string; filter: TaskStatus | 'all' } | null>(null)
  const [toast, setToast] = useState<ToastState>({ message: '', isError: false, visible: false })
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  const departments = getDepartments(tasks)

  const showToast = useCallback((message: string, isError = false) => {
    clearTimeout(toastTimer.current)
    setToast({ message, isError, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }, [])

  function handleViewChange(next: View) {
    if (!isManager && next !== 'employee') return
    setView(next)
    if (next === 'manager') mutate()
  }

  async function handleSubmit(input: TaskInput, id?: string) {
    try {
      if (id) await updateTask(id, input)
      else await createTask(input)
      await mutate()
      showToast(id ? 'تم تحديث المهمة بنجاح' : 'تمت إضافة المهمة بنجاح')
      setEditingTask(null)
      return true
    } catch {
      showToast('تعذر حفظ المهمة، حاول مرة أخرى', true)
      return false
    }
  }

  async function handleDelete(task: Task) {
    try {
      await mutate(
        async (current) => {
          await deleteTask(task.id)
          return current?.filter((t) => t.id !== task.id)
        },
        { optimisticData: (current) => current?.filter((t) => t.id !== task.id) ?? [], rollbackOnError: true },
      )
      if (editingTask?.id === task.id) setEditingTask(null)
      showToast('تم حذف المهمة بنجاح')
    } catch {
      showToast('تعذر حذف المهمة', true)
    }
  }

  async function handleRename(oldName: string, newName: string) {
    if (!oldName || !newName) {
      showToast('اختر القسم القديم وأدخل الاسم الجديد', true)
      return false
    }
    try {
      await renameDepartment(oldName, newName)
      await mutate()
      showToast('تم تعديل اسم القسم بنجاح')
      return true
    } catch {
      showToast('تعذر تعديل اسم القسم', true)
      return false
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const modalTasks = modal ? (modal.filter === 'all' ? tasks : tasks.filter((t) => t.status === modal.filter)) : []
  const connection = error ? 'error' : isLoading ? 'loading' : 'online'

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800">
      <AppHeader
        view={view}
        onViewChange={handleViewChange}
        connection={connection}
        profile={profile}
      />

      <main className="mx-auto w-full max-w-7xl flex-grow px-4 py-8 sm:px-6 lg:px-8">
        {view === 'employee' ? (
          <div className="space-y-6">
            <div className="flex flex-col items-start justify-between gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 text-white shadow-xl shadow-indigo-100 md:flex-row md:items-center">
              <div>
                <span className="rounded-full bg-indigo-500/40 px-3 py-1 text-xs font-semibold">بوابة الموظف</span>
                <h2 className="mt-2 text-2xl font-black">تسجيل وتحديث المهام والأقسام</h2>
                <p className="mt-1 text-sm text-indigo-100">
                  أدخل مهامك، قم بإدارة وتخصيص الأقسام بحرية، وحدث نسب الإنجاز بدقة.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-indigo-700">
                  <User className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-xs text-indigo-200">{profile.fullName}</div>
                  <div className="text-sm font-bold tracking-tight" dir="ltr">
                    @{profile.username}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <TaskForm
                editingTask={editingTask}
                departments={departments}
                defaultEmployeeName={profile.fullName}
                onSubmit={handleSubmit}
                onCancel={() => setEditingTask(null)}
              />
              <div className="space-y-6 lg:col-span-2">
                <DepartmentRename departments={departments} onRename={handleRename} />
                <EmployeeTasksTable tasks={tasks} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />
              </div>
            </div>
          </div>
        ) : view === 'manager' && isManager ? (
          <ManagerView
            tasks={tasks}
            isRefreshing={isValidating}
            onRefresh={() => mutate()}
            onOpenMetric={(title, filter) => setModal({ title, filter })}
          />
        ) : isManager ? (
          <UsersPanel users={users} currentUserId={profile.id} onNotify={showToast} />
        ) : null}
      </main>

      <DetailModal
        open={modal !== null}
        title={`تفاصيل الحالة: ${modal?.title ?? ''}`}
        subtitle={`عدد المهام: ${modalTasks.length}`}
        tasks={modalTasks}
        onClose={() => setModal(null)}
      />
      <Toast {...toast} />
    </div>
  )
}
