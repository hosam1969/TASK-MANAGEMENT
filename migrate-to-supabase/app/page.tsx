import { redirect } from 'next/navigation'
import { TaskBoard } from '@/components/task-board/task-board'
import { getCurrentProfile, type Profile } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  let users: Profile[] = []
  if (profile.role === 'manager') {
    const supabase = await createClient()
    const { data } = await supabase
      .from('profiles')
      .select('id, username, full_name, role')
      .order('created_at', { ascending: true })
    users = (data ?? []).map((u) => ({ id: u.id, username: u.username, fullName: u.full_name, role: u.role }))
  }

  return <TaskBoard profile={profile} users={users} />
}
