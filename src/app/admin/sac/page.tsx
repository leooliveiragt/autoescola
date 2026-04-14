import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminSACClient } from '@/components/admin/admin-sac-client'

export default async function AdminSACPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const tickets = await prisma.ticket.findMany({
    include: {
      autor: { select: { nome: true, email: true, role: true } },
      mensagens: {
        orderBy: { createdAt: 'asc' },
        include: { autor: { select: { nome: true, role: true } } },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return <AdminSACClient tickets={tickets as any} />
}
