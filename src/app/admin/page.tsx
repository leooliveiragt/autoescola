import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminDashboardClient } from '@/components/admin/admin-dashboard-client'

export default async function AdminPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const [
    totalAlunos,
    totalInstrutores,
    instrutoresAtivos,
    totalAulas,
    aulasMes,
    kycPendentes,
    subscricoesAtivas,
    alunosNovos,
    instrutoresNovos,
    recentUsers,
    kycQueue,
    cidadeStats,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'ALUNO' } }),
    prisma.user.count({ where: { role: 'INSTRUTOR' } }),
    prisma.perfilInstrutor.count({ where: { visivel: true } }),
    prisma.aula.count(),
    prisma.aula.count({
      where: {
        createdAt: { gte: new Date(new Date().setDate(1)) },
      },
    }),
    prisma.kYC.count({ where: { status: 'PENDENTE' } }),
    prisma.subscription.count({ where: { status: 'ATIVA' } }),
    prisma.user.count({
      where: {
        role: 'ALUNO',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.user.count({
      where: {
        role: 'INSTRUTOR',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { kyc: true },
    }),
    prisma.kYC.findMany({
      where: { status: 'PENDENTE' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.endereco.groupBy({
      by: ['cidade'],
      where: { user: { role: 'INSTRUTOR' }, principal: true },
      _count: true,
      orderBy: { _count: { cidade: 'desc' } },
      take: 6,
    }),
  ])

  const metrics = {
    totalAlunos,
    totalInstrutores,
    instrutoresAtivos,
    totalAulas,
    aulasMes,
    kycPendentes,
    subscricoesAtivas,
    alunosNovosSetmana: alunosNovos,
    instrutoresNovosSetmana: instrutoresNovos,
    receitaMes: subscricoesAtivas * 14.90,
    mediaAvaliacoes: 4.87,
  }

  return (
    <AdminDashboardClient
      metrics={metrics}
      recentUsers={recentUsers as any}
      kycQueue={kycQueue as any}
      cidadeStats={cidadeStats}
    />
  )
}
