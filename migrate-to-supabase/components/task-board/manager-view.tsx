import {
  CircleCheck,
  Folder,
  History,
  Layers,
  Loader,
  RotateCw,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Task, TaskStatus } from '@/lib/tasks'
import { ProgressBar } from './status-badge'

type Filter = TaskStatus | 'all'

type Props = {
  tasks: Task[]
  isRefreshing: boolean
  onRefresh: () => void
  onOpenMetric: (title: string, filter: Filter) => void
}

const METRICS: { title: string; filter: Filter; icon: LucideIcon; label: string; value: string; iconBox: string; extra?: string }[] = [
  { title: 'إجمالي المهام', filter: 'all', icon: Layers, label: 'text-slate-500', value: 'text-slate-900', iconBox: 'bg-indigo-50 text-indigo-600' },
  { title: 'مكتمل', filter: 'مكتمل', icon: CircleCheck, label: 'text-emerald-600', value: 'text-emerald-600', iconBox: 'bg-emerald-50 text-emerald-600' },
  { title: 'جاري', filter: 'جاري', icon: Loader, label: 'text-blue-600', value: 'text-blue-600', iconBox: 'bg-blue-50 text-blue-600' },
  { title: 'متأخر', filter: 'متأخر', icon: History, label: 'text-amber-600', value: 'text-amber-600', iconBox: 'bg-amber-50 text-amber-600' },
  { title: 'قرارات مطلوبة', filter: 'قرارات مطلوبة', icon: TriangleAlert, label: 'text-rose-600', value: 'text-rose-600', iconBox: 'bg-rose-50 text-rose-600', extra: 'col-span-2 md:col-span-1' },
]

type DeptSummary = {
  name: string
  total: number
  completed: number
  inProgress: number
  delayed: number
  decisions: number
  progressSum: number
  lastUpdate: string
}

function summarize(tasks: Task[]) {
  const map = new Map<string, DeptSummary>()
  for (const t of tasks) {
    const name = t.department || 'عام'
    const d = map.get(name) ?? { name, total: 0, completed: 0, inProgress: 0, delayed: 0, decisions: 0, progressSum: 0, lastUpdate: t.updatedAt }
    d.total++
    d.progressSum += t.progress || 0
    if (t.status === 'مكتمل') d.completed++
    if (t.status === 'جاري') d.inProgress++
    if (t.status === 'متأخر') d.delayed++
    if (t.status === 'قرارات مطلوبة') d.decisions++
    if (t.updatedAt > d.lastUpdate) d.lastUpdate = t.updatedAt
    map.set(name, d)
  }
  return [...map.values()]
}

const dateFormatter = new Intl.DateTimeFormat('ar', { dateStyle: 'medium', timeStyle: 'short' })

export function ManagerView({ tasks, isRefreshing, onRefresh, onOpenMetric }: Props) {
  const depts = summarize(tasks)
  const count = (filter: Filter) => (filter === 'all' ? tasks.length : tasks.filter((t) => t.status === filter).length)

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            لوحة المراقبة الإدارية
          </span>
          <h2 className="mt-2 text-2xl font-black text-slate-900">تقرير متابعة الأقسام والمهام</h2>
          <p className="mt-0.5 text-sm text-slate-500">الأسبوع: 21 - 25 سبتمبر 2026 | تحديث لحظي من جميع الأقسام</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          <RotateCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} aria-hidden="true" /> تحديث البيانات
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {METRICS.map((m) => {
          const Icon = m.icon
          return (
            <button
              type="button"
              key={m.title}
              onClick={() => onOpenMetric(m.title, m.filter)}
              className={cn(
                'group rounded-2xl border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:shadow-md',
                m.extra,
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn('text-xs font-bold', m.label)}>{m.title}</span>
                <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg transition group-hover:scale-110', m.iconBox)}>
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </div>
              </div>
              <div className={cn('mt-3 text-2xl font-black', m.value)}>{count(m.filter)}</div>
            </button>
          )
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5">
          <h3 className="text-base font-bold text-slate-900">جدول حالة الأقسام ونسب الإنجاز</h3>
          <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">{depts.length} أقسام</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-right">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
                <th className="px-4 py-3.5">اسم القسم</th>
                <th className="px-4 py-3.5">إجمالي المهام</th>
                <th className="px-4 py-3.5">مكتمل</th>
                <th className="px-4 py-3.5">جاري</th>
                <th className="px-4 py-3.5">متأخر</th>
                <th className="px-4 py-3.5">قرارات مطلوبة</th>
                <th className="px-4 py-3.5">نسبة الإنجاز الإجمالية</th>
                <th className="px-4 py-3.5">آخر تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {depts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    لا توجد أقسام مسجلة.
                  </td>
                </tr>
              ) : (
                depts.map((d) => (
                  <tr key={d.name} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4 font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Folder className="h-3.5 w-3.5 text-indigo-500" aria-hidden="true" />
                        {d.name}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold">{d.total}</td>
                    <td className="px-4 py-4 font-bold text-emerald-600">{d.completed}</td>
                    <td className="px-4 py-4 font-bold text-blue-600">{d.inProgress}</td>
                    <td className="px-4 py-4 font-bold text-amber-600">{d.delayed}</td>
                    <td className="px-4 py-4 font-bold text-rose-600">{d.decisions}</td>
                    <td className="px-4 py-4">
                      <ProgressBar value={Math.round(d.progressSum / d.total)} className="h-2.5 w-28" />
                    </td>
                    <td className="px-4 py-4 text-xs text-slate-500">{dateFormatter.format(new Date(d.lastUpdate))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
