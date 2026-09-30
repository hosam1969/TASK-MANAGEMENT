'use client'

import { useActionState } from 'react'
import { signIn, type ActionState } from '@/app/actions/auth'
import { authButtonClass, authInputClass } from './auth-card'

export function LoginForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(signIn, {})

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="username" className="mb-1 block text-sm font-semibold text-slate-700">
          اسم المستخدم
        </label>
        <input
          id="username"
          name="username"
          required
          autoComplete="username"
          dir="ltr"
          autoCapitalize="none"
          className={`${authInputClass} text-left`}
        />
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
          autoComplete="current-password"
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
        {pending ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>
    </form>
  )
}
