import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth/auth-card'
import { LoginForm } from '@/components/auth/login-form'
import { getCurrentProfile, hasManager } from '@/lib/auth'

export default async function LoginPage() {
  if (await getCurrentProfile()) redirect('/')
  const managerExists = await hasManager()

  return (
    <AuthCard title="تسجيل الدخول" subtitle="نظام إدارة ومتابعة الأقسام والمهام">
      <LoginForm />
      {!managerExists && (
        <p className="mt-6 text-center text-sm text-slate-600">
          {'لا يوجد حساب مدير بعد. '}
          <Link href="/setup" className="font-semibold text-indigo-600 hover:underline">
            إعداد حساب المدير
          </Link>
        </p>
      )}
      {managerExists && (
        <p className="mt-6 text-center text-xs text-slate-500">
          ليس لديك حساب؟ تواصل مع المدير لإنشاء حساب لك.
        </p>
      )}
    </AuthCard>
  )
}
