import { ChartLine, Gauge, LogOut, UserPen, Users } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import type { Profile } from '@/lib/auth'
import { cn } from '@/lib/utils'

export type View = 'employee' | 'manager' | 'users'

type Props = {
  view: View
  onViewChange: (view: View) => void
  connection: 'loading' | 'online' | 'error'
  profile: Profile
}

const CONNECTION = {
  loading: { label: 'جاري الاتصال بقاعدة البيانات...', box: 'bg-slate-50 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  online: { label: 'متصل بالقاعدة السحابية', box: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  error: { label: 'تعذر الاتصال بالقاعدة', box: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
}

export function AppHeader({ view, onViewChange, connection, profile }: Props) {
  const status = CONNECTION[connection]
  const isManager = profile.role === 'manager'
  const tabClass = (active: boolean) =>
    cn(
      'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all',
      active ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900',
    )

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
            <ChartLine className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">نظام إدارة ومتابعة الأقسام والمهام</h1>
            <p className="text-xs text-slate-500">الأسبوع: 21 - 25 سبتمبر 2026</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div
            role="status"
            className={cn('flex items-center rounded-full border px-3 py-1.5 text-xs font-medium', status.box)}
          >
            <span className={cn('ml-1.5 h-2 w-2 rounded-full', status.dot)} aria-hidden="true" />
            {status.label}
          </div>

          {isManager && (
            <nav className="flex rounded-xl bg-slate-100 p-1" aria-label="التبديل بين الشاشات">
              <button
                type="button"
                aria-pressed={view === 'employee'}
                onClick={() => onViewChange('employee')}
                className={tabClass(view === 'employee')}
              >
                <UserPen className="h-4 w-4" aria-hidden="true" /> شاشة الموظف
              </button>
              <button
                type="button"
                aria-pressed={view === 'manager'}
                onClick={() => onViewChange('manager')}
                className={tabClass(view === 'manager')}
              >
                <Gauge className="h-4 w-4" aria-hidden="true" /> لوحة المدير
              </button>
              <button
                type="button"
                aria-pressed={view === 'users'}
                onClick={() => onViewChange('users')}
                className={tabClass(view === 'users')}
              >
                <Users className="h-4 w-4" aria-hidden="true" /> المستخدمون
              </button>
            </nav>
          )}

          <div className="flex items-center gap-2 border-r border-slate-200 pr-3">
            <div className="text-left leading-tight">
              <div className="text-sm font-semibold text-slate-800">{profile.fullName}</div>
              <div className="text-xs text-slate-500">{isManager ? 'مدير' : 'موظف'}</div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </header>
  )
}
