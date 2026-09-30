import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type Role = 'manager' | 'employee'

export type Profile = {
  id: string
  username: string
  fullName: string
  role: Role
}

const USERNAME_PATTERN = /^[a-z0-9_.-]{3,32}$/
const LOGIN_DOMAIN = 'accounts.taskboard.app'

export function normalizeUsername(raw: string) {
  return raw.trim().toLowerCase()
}

export function isValidUsername(username: string) {
  return USERNAME_PATTERN.test(username)
}

export function usernameToEmail(username: string) {
  return `${username}@${LOGIN_DOMAIN}`
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, username, full_name, role')
    .eq('id', user.id)
    .maybeSingle()
  if (!data) return null

  return { id: data.id, username: data.username, fullName: data.full_name, role: data.role }
}

export async function hasManager() {
  const { count } = await createAdminClient()
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'manager')
  return (count ?? 0) > 0
}
