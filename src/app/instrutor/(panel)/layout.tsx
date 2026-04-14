import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { InstructorSidebar } from '@/components/instrutor/instructor-sidebar'

export default async function InstructorPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') redirect('/login')

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <InstructorSidebar
        userName={session.user.name ?? ''}
        userEmail={session.user.email ?? ''}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
