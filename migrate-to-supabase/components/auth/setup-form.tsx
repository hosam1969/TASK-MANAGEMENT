'use client'

import { useActionState } from 'react'
import { setupManager, type ActionState } from '@/app/actions/auth'
import { authButtonClass, authInputClass } from './auth-card'

export function SetupForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(setupManager, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-1 block text-sm font-semibold text-slate-700">
          الاسم الكامل
        </label>
        <input id="fullName" name="fullName" required maxLength={200} className={authInputClass} />
      </div>
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-semibold text-slate-700">
          اسم المستخدم
        </label>
        <input
          id="username"
          name="username"
          required
          dir="ltr"
          autoCapitalize="none"
          autoComplete="username"
          pattern="[a-zA-Z0-9_.\-]{3,32}"
          placeholder="manager"
          className={`${authInputClass} text-left`}
        />
        <p className="mt-1 text-xs text-slate-500">أحرف إنجليزية وأرقام فقط (3-32)</p>
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-semibold text-slate-700">
          كلمة المرور
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={72}
          autoComplete="new-password"
          dir="ltr"
          className={`${authInputClass} text-left`}
        />
      </div>
      {state.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={authButtonClass}>
        {pending ? 'جاري الإنشاء...' : 'إنشاء حساب المدير'}
      </button>
    </form>
  )
}
