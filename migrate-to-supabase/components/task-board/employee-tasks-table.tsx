import { ListChecks, Pencil, Trash2 } from 'lucide-react'
import type { Task } from '@/lib/tasks'
import { ProgressBar, StatusBadge } from './status-badge'

type Props = {
  tasks: Task[]
  isLoading: boolean
  onEdit: (task: Task) => void
  onDelete: (task: Task) => void
}

export function EmployeeTasksTable({ tasks, isLoading, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <ListChecks className="h-4 w-4 text-indigo-600" aria-hidden="true" /> مهامي المسجلة
        </h3>
        <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700">
          {tasks.length} مهام
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-right">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-500">
              <th className="px-4 py-3">الموظف</th>
              <th className="px-4 py-3">القسم</th>
              <th className="px-4 py-3">المهمة</th>
              <th className="px-4 py-3">الإنجاز</th>
              <th className="px-4 py-3">الحالة</th>
              <th className="px-4 py-3 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  {isLoading ? 'جاري تحميل المهام...' : 'لا توجد مهام مسجلة.'}
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
                <tr key={task.id} className="transition hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{task.employeeName}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {task.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{task.taskTitle}</td>
                  <td className="px-4 py-3">
                    <ProgressBar value={task.progress} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={task.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(task)}
                        aria-label={`تعديل مهمة ${task.taskTitle}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                      >
                        <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(task)}
                        aria-label={`حذف مهمة ${task.taskTitle}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
