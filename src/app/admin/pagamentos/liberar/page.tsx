import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AdminLiberarPagamentosClient } from '@/components/admin/admin-liberar-pagamentos-client'

export default async function AdminLiberarPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  // Previous full week Mon–Sun
  const hoje = new Date()
  const diaSemana = hoje.getDay()
  const inicioSemanaPassada = new Date(hoje)
  inicioSemanaPassada.setDate(hoje.getDate() - diaSemana - 6)
  inicioSemanaPassada.setHours(0, 0, 0, 0)
  const fimSemanaPassada = new Date(inicioSemanaPassada)
  fimSemanaPassada.setDate(inicioSemanaPassada.getDate() + 6)
  fimSemanaPassada.setHours(23, 59, 59, 999)

  const aulas = await prisma.aula.findMany({
    where: {
      status: 'CONFIRMADA',
      pagamentoLiberadoEm: null,
      data: { gte: inicioSemanaPassada, lte: fimSemanaPassada },
    },
    include: {
      aluno: { select: { nome: true } },
      instrutor: { select: { nome: true } },
      reclamacao: true,
    },
    orderBy: { data: 'asc' },
  })

  return <AdminLiberarPagamentosClient aulas={aulas as any} semanaInicio={inicioSemanaPassada.toISOString()} semanaFim={fimSemanaPassada.toISOString()} />
}
