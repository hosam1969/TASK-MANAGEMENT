import { cn } from '@/lib/utils'
import type { TaskStatus } from '@/lib/tasks'

const STATUS_CLASSES: Record<TaskStatus, string> = {
  جاري: 'bg-blue-50 text-blue-700 border-blue-200',
  مكتمل: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  متأخر: 'bg-amber-50 text-amber-700 border-amber-200',
  'قرارات مطلوبة': 'bg-rose-50 text-rose-700 border-rose-200',
}

export function StatusBadge({ status, children }: { status: TaskStatus; children?: React.ReactNode }) {
  return (
    <span className={cn('whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold', STATUS_CLASSES[status])}>
      {children ?? status}
    </span>
  )
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={cn('h-2 w-24 overflow-hidden rounded-full bg-slate-100', className)}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full bg-indigo-600" style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs font-bold">{value}%</span>
    </div>
  )
}
