import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function InstructorIndexPage() {
  const session = await auth()

  if (!session) redirect('/login')
  if (session.user.role === 'INSTRUTOR') redirect('/instrutor/dashboard')
  if (session.user.role === 'ADMIN') redirect('/admin')

  redirect('/')
}
