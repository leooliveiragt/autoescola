import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const [kycPendentes, sacPendentes] = await Promise.all([
    prisma.kYC.count({ where: { status: 'PENDENTE' } }),
    (prisma as any).ticket.count({ where: { status: { in: ['ABERTO', 'EM_ATENDIMENTO'] } } }),
  ])

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar kycPendentes={kycPendentes} sacPendentes={sacPendentes} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}
