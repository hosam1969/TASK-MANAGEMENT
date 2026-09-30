import { redirect } from 'next/navigation'
import { AuthCard } from '@/components/auth/auth-card'
import { SetupForm } from '@/components/auth/setup-form'
import { hasManager } from '@/lib/auth'

export default async function SetupPage() {
  if (await hasManager()) redirect('/login')

  return (
    <AuthCard title="إعداد حساب المدير" subtitle="أنشئ أول حساب مدير لبدء استخدام النظام">
      <SetupForm />
    </AuthCard>
  )
}
