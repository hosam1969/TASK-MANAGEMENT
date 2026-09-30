import { CircleAlert, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

export type ToastState = { message: string; isError: boolean; visible: boolean }

export function Toast({ message, isError, visible }: ToastState) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-5 left-5 z-50 flex items-center gap-3 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-xl transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-24 opacity-0',
      )}
    >
      {isError ? (
        <CircleAlert className="h-4 w-4 text-rose-400" aria-hidden="true" />
      ) : (
        <CircleCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
      )}
      <span>{message}</span>
    </div>
  )
}
