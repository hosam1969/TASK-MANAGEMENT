'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { KeyRound, Trash2, UserPlus, Users } from 'lucide-react'
import {
  createUserAccount,
  deleteUserAccount,
  resetUserPassword,
  type ActionState,
} from '@/app/actions/auth'
import type { Profile } from '@/lib/auth'

const inputClass =
  'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'

type Props = {
  users: Profile[]
  currentUserId: string
  onNotify: (message: string, isError?: boolean) => void
}

export function UsersPanel({ users, currentUserId, onNotify }: Props) {
  const [state, action, pending] = useActionState<ActionState, FormData>(createUserAccount, {})
  const formRef = useRef<HTMLFormElement>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  useEffect(() => {
    if (state.success) {
      onNotify(state.success)
      formRef.current?.reset()
    } else if (state.error) {
      onNotify(state.error, true)
    }
  }, [state, onNotify])

  function handleReset(user: Profile) {
    const password = window.prompt(`كلمة المرور الجديدة لـ ${user.fullName} (8 أحرف على الأقل):`)
    if (!password) return
    setBusyId(user.id)
    startTransition(async () => {
      const result = await resetUserPassword(user.id, password)
      onNotify(result.error ?? result.success ?? '', Boolean(result.error))
      setBusyId(null)
    })
  }

  function handleDelete(user: Profile) {
    if (!window.confirm(`هل أنت متأكد من حذف حساب ${user.fullName}؟`)) return
    setBusyId(user.id)
    startTransition(async () => {
      const result = await deleteUserAccount(user.id)
      onNotify(result.error ?? result.success ?? '', Boolean(result.error))
      setBusyId(null)
    })
  }

  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-3" aria-labelledby="users-heading">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <UserPlus className="h-5 w-5 text-indigo-600" aria-hidden="true" />
          إضافة مستخدم جديد
        </h3>
        <form ref={formRef} action={action} className="space-y-4">
          <div>
            <label htmlFor="newFullName" className="mb-1 block text-sm font-semibold text-slate-700">
              الاسم الكامل
            </label>
            <input id="newFullName" name="fullName" required maxLength={200} className={inputClass} />
          </div>
          <div>
            <label htmlFor="newUsername" className="mb-1 block text-sm font-semibold text-slate-700">
              اسم المستخدم
            </label>
            <input
              id="newUsername"
              name="username"
              required
              dir="ltr"
              autoCapitalize="none"
              autoComplete="off"
              pattern="[a-zA-Z0-9_.\-]{3,32}"
              className={`${inputClass} text-left`}
            />
          </div>
          <div>
            <label htmlFor="newPassword" className="mb-1 block text-sm font-semibold text-slate-700">
              كلمة المرور
            </label>
            <input
              id="newPassword"
              name="password"
              type="password"
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              dir="ltr"
              className={`${inputClass} text-left`}
            />
          </div>
          <div>
            <label htmlFor="newRole" className="mb-1 block text-sm font-semibold text-slate-700">
              الصلاحية
            </label>
            <select id="newRole" name="role" defaultValue="employee" className={`${inputClass} bg-white`}>
              <option value="employee">موظف</option>
              <option value="manager">مدير</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 id="users-heading" className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Users className="h-5 w-5 text-indigo-600" aria-hidden="true" />
            حسابات المستخدمين
          </h3>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {users.length} مستخدم
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500">
              <tr>
                <th scope="col" className="px-5 py-3">الاسم</th>
                <th scope="col" className="px-5 py-3">اسم المستخدم</th>
                <th scope="col" className="px-5 py-3">الصلاحية</th>
                <th scope="col" className="px-5 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/60">
                  <td className="px-5 py-3 font-semibold text-slate-800">
                    {user.fullName}
                    {user.id === currentUserId && <span className="mr-2 text-xs text-slate-400">(أنت)</span>}
                  </td>
                  <td className="px-5 py-3 font-mono text-slate-600" dir="ltr">
                    {user.username}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={
                        user.role === 'manager'
                          ? 'rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700'
                          : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700'
                      }
                    >
                      {user.role === 'manager' ? 'مدير' : 'موظف'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleReset(user)}
                        disabled={busyId === user.id}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50"
                        aria-label={`تغيير كلمة مرور ${user.fullName}`}
                      >
                        <KeyRound className="h-4 w-4" aria-hidden="true" />
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          type="button"
                          onClick={() => handleDelete(user)}
                          disabled={busyId === user.id}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                          aria-label={`حذف ${user.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
