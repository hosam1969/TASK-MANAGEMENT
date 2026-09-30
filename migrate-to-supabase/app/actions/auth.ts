'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getCurrentProfile,
  hasManager,
  isValidUsername,
  normalizeUsername,
  usernameToEmail,
  type Role,
} from '@/lib/auth'

export type ActionState = { error?: string; success?: string }

const MIN_PASSWORD = 8

function readAccountFields(formData: FormData) {
  return {
    username: normalizeUsername(String(formData.get('username') ?? '')),
    fullName: String(formData.get('fullName') ?? '').trim(),
    password: String(formData.get('password') ?? ''),
  }
}

function validateAccount({ username, fullName, password }: ReturnType<typeof readAccountFields>) {
  if (!isValidUsername(username))
    return 'اسم المستخدم يجب أن يكون 3-32 حرفاً إنجليزياً صغيراً أو أرقاماً أو (_ . -)'
  if (!fullName || fullName.length > 200) return 'الرجاء إدخال الاسم الكامل'
  if (password.length < MIN_PASSWORD || password.length > 72)
    return `كلمة المرور يجب أن تكون ${MIN_PASSWORD} أحرف على الأقل`
  return null
}

async function createAccount(fields: ReturnType<typeof readAccountFields>, role: Role): Promise<string | null> {
  const admin = createAdminClient()

  const { data: existing } = await admin.from('profiles').select('id').eq('username', fields.username).maybeSingle()
  if (existing) return 'اسم المستخدم مستخدم بالفعل'

  const { data, error } = await admin.auth.admin.createUser({
    email: usernameToEmail(fields.username),
    password: fields.password,
    email_confirm: true,
    user_metadata: { username: fields.username, full_name: fields.fullName },
  })
  if (error || !data.user) {
    console.error('[auth] createUser failed:', error?.message)
    return error?.code === 'weak_password' ? 'كلمة المرور ضعيفة، اختر كلمة أقوى' : 'تعذر إنشاء الحساب'
  }

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: data.user.id, username: fields.username, full_name: fields.fullName, role })
  if (profileError) {
    console.error('[auth] profile insert failed:', profileError.message)
    await admin.auth.admin.deleteUser(data.user.id)
    return 'تعذر إنشاء الحساب'
  }
  return null
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const username = normalizeUsername(String(formData.get('username') ?? ''))
  const password = String(formData.get('password') ?? '')
  if (!username || !password) return { error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email: usernameToEmail(username), password })
  if (error) {
    if (error.status === 429) return { error: 'محاولات كثيرة، الرجاء الانتظار قليلاً ثم المحاولة مجدداً' }
    if (error.code === 'invalid_credentials') return { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }
    console.error('[auth] signIn failed:', error.message)
    return { error: 'حدث خطأ غير متوقع، حاول مرة أخرى' }
  }
  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function setupManager(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (await hasManager()) return { error: 'تم إعداد حساب المدير مسبقاً' }

  const fields = readAccountFields(formData)
  const invalid = validateAccount(fields)
  if (invalid) return { error: invalid }

  const failure = await createAccount(fields, 'manager')
  if (failure) return { error: failure }

  const supabase = await createClient()
  await supabase.auth.signInWithPassword({ email: usernameToEmail(fields.username), password: fields.password })
  redirect('/')
}

export async function createUserAccount(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const me = await getCurrentProfile()
  if (me?.role !== 'manager') return { error: 'غير مصرح لك بهذا الإجراء' }

  const fields = readAccountFields(formData)
  const role: Role = formData.get('role') === 'manager' ? 'manager' : 'employee'
  const invalid = validateAccount(fields)
  if (invalid) return { error: invalid }

  const failure = await createAccount(fields, role)
  if (failure) return { error: failure }

  revalidatePath('/')
  return { success: `تم إنشاء حساب ${fields.fullName} بنجاح` }
}

export async function resetUserPassword(userId: string, password: string): Promise<ActionState> {
  const me = await getCurrentProfile()
  if (me?.role !== 'manager') return { error: 'غير مصرح لك بهذا الإجراء' }
  if (password.length < MIN_PASSWORD || password.length > 72)
    return { error: `كلمة المرور يجب أن تكون ${MIN_PASSWORD} أحرف على الأقل` }

  const { error } = await createAdminClient().auth.admin.updateUserById(userId, { password })
  if (error) {
    console.error('[auth] reset password failed:', error.message)
    return { error: 'تعذر تغيير كلمة المرور' }
  }
  return { success: 'تم تغيير كلمة المرور بنجاح' }
}

export async function deleteUserAccount(userId: string): Promise<ActionState> {
  const me = await getCurrentProfile()
  if (me?.role !== 'manager') return { error: 'غير مصرح لك بهذا الإجراء' }
  if (me.id === userId) return { error: 'لا يمكنك حذف حسابك الحالي' }

  const { error } = await createAdminClient().auth.admin.deleteUser(userId)
  if (error) {
    console.error('[auth] delete user failed:', error.message)
    return { error: 'تعذر حذف المستخدم' }
  }
  revalidatePath('/')
  return { success: 'تم حذف المستخدم' }
}
