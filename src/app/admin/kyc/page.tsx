import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminKYCClient } from '@/components/admin/admin-kyc-client'

export default async function AdminKYCPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const kycs = await prisma.kYC.findMany({
    include: {
      user: {
        include: {
          perfilInstrutor: { select: { id: true } },
        },
      },
    },
    orderBy: [
      { status: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return <AdminKYCClient kycs={kycs as any} />
}
