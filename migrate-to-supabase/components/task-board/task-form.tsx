'use client'

import { useEffect, useState } from 'react'
import { PenSquare } from 'lucide-react'
import type { Task, TaskInput, TaskStatus } from '@/lib/tasks'

const EMPTY: TaskInput = { employeeName: '', department: '', taskTitle: '', progress: 0, status: 'جاري' }

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

type Props = {
  editingTask: Task | null
  departments: string[]
  defaultEmployeeName?: string
  onSubmit: (input: TaskInput, id?: string) => Promise<boolean>
  onCancel: () => void
}

export function TaskForm({ editingTask, departments, defaultEmployeeName = '', onSubmit, onCancel }: Props) {
  const empty = { ...EMPTY, employeeName: defaultEmployeeName }
  const [values, setValues] = useState<TaskInput>(empty)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setValues(
      editingTask
        ? {
            employeeName: editingTask.employeeName,
            department: editingTask.department,
            taskTitle: editingTask.taskTitle,
            progress: editingTask.progress,
            status: editingTask.status,
          }
        : { ...EMPTY, employeeName: defaultEmployeeName },
    )
  }, [editingTask, defaultEmployeeName])

  const set = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSaving(true)
    const ok = await onSubmit(
      {
        ...values,
        employeeName: values.employeeName.trim(),
        department: values.department.trim(),
        taskTitle: values.taskTitle.trim(),
      },
      editingTask?.id,
    )
    setSaving(false)
    if (ok) setValues(empty)
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
        <PenSquare className="h-5 w-5 text-indigo-600" aria-hidden="true" />
        {editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="employeeName" className="mb-1 block text-sm font-semibold text-slate-700">
            اسم الموظف / المسؤول
          </label>
          <input
            id="employeeName"
            required
            maxLength={200}
            placeholder="مثال: أحمد محمد"
            value={values.employeeName}
            onChange={(e) => set('employeeName', e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="departmentInput" className="mb-1 block text-sm font-semibold text-slate-700">
            اسم القسم (كتابة أو اختيار)
          </label>
          <input
            id="departmentInput"
            list="departmentSuggestions"
            required
            maxLength={200}
            placeholder="اكتب أو اختر القسم..."
            value={values.department}
            onChange={(e) => set('department', e.target.value)}
            className={inputClass}
          />
          <datalist id="departmentSuggestions">
            {departments.map((d) => (
              <option key={d} value={d} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="taskTitle" className="mb-1 block text-sm font-semibold text-slate-700">
            عنوان المهمة أو الوصف
          </label>
          <textarea
            id="taskTitle"
            rows={3}
            required
            maxLength={2000}
            placeholder="تفاصيل المهمة المطلوبة..."
            value={values.taskTitle}
            onChange={(e) => set('taskTitle', e.target.value)}
            className={`${inputClass} resize-none`}
          />
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between">
            <label htmlFor="progressInput" className="text-sm font-semibold text-slate-700">
              نسبة الإنجاز (%)
            </label>
            <span className="text-sm font-bold text-indigo-600">{values.progress}%</span>
          </div>
          <input
            id="progressInput"
            type="range"
            min={0}
            max={100}
            value={values.progress}
            onChange={(e) => set('progress', Number(e.target.value))}
            className="w-full cursor-pointer accent-indigo-600"
          />
        </div>

        <div>
          <label htmlFor="taskStatus" className="mb-1 block text-sm font-semibold text-slate-700">
            حالة المهمة
          </label>
          <select
            id="taskStatus"
            value={values.status}
            onChange={(e) => set('status', e.target.value as TaskStatus)}
            className={`${inputClass} bg-white`}
          >
            <option value="جاري">جاري التنفيذ</option>
            <option value="مكتمل">مكتمل</option>
            <option value="متأخر">متأخر</option>
            <option value="قرارات مطلوبة">قرارات مطلوبة</option>
          </select>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? 'جاري الحفظ...' : editingTask ? 'حفظ التعديلات' : 'حفظ المهمة'}
          </button>
          {editingTask && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              إلغاء
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
