'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import type { Task } from '@/lib/tasks'
import { StatusBadge } from './status-badge'

type Props = {
  open: boolean
  title: string
  subtitle: string
  tasks: Task[]
  onClose: () => void
}

export function DetailModal({ open, title, subtitle, tasks, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modalTitle"
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-5">
          <div>
            <h3 id="modalTitle" className="text-lg font-black text-slate-900">{title}</h3>
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:text-slate-900"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-grow space-y-4 overflow-y-auto p-6">
          {tasks.length === 0 ? (
            <div className="py-8 text-center text-slate-400">لا توجد مهام</div>
          ) : (
            tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-4 rounded-2xl border bg-slate-50 p-4">
                <div>
                  <div className="font-bold">
                    {t.employeeName} - <span className="text-xs text-indigo-600">{t.department}</span>
                  </div>
                  <p className="text-sm text-slate-600">{t.taskTitle}</p>
                </div>
                <StatusBadge status={t.status}>
                  {t.status} ({t.progress}%)
                </StatusBadge>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-end border-t border-slate-100 bg-slate-50 p-4">
          <button type="button" onClick={onClose} className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
