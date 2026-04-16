import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminAvaliacoesClient } from '@/components/admin/admin-avaliacoes-client'

export default async function AdminAvaliacoesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const avaliacoes = await prisma.avaliacao.findMany({
    include: {
      autor: { select: { nome: true } },
      alvo: { select: { nome: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return <AdminAvaliacoesClient avaliacoes={avaliacoes as any} />
}
