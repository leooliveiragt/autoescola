import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminAlunosClient } from '@/components/admin/admin-alunos-client'

export default async function AdminAlunosPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const alunos = await prisma.user.findMany({
    where: { role: 'ALUNO' },
    orderBy: { createdAt: 'desc' },
    include: { kyc: true },
  })

  return <AdminAlunosClient alunos={alunos as any} />
}
