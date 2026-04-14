import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminInstrutoresClient } from '@/components/admin/admin-instrutores-client'

export default async function AdminInstrutoresPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const instrutores = await prisma.perfilInstrutor.findMany({
    include: {
      user: { include: { kyc: true } },
      subscription: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminInstrutoresClient instrutores={instrutores as any} />
}
