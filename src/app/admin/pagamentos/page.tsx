import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminPagamentosClient } from '@/components/admin/admin-pagamentos-client'

export default async function AdminPagamentosPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const subscriptions = await prisma.subscription.findMany({
    include: { instrutor: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminPagamentosClient subscriptions={subscriptions as any} />
}
