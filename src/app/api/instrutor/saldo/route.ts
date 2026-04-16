import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { userId: session.user.id },
    select: { id: true, saldoDevedor: true },
  })

  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  // Aulas presenciais pendentes (ainda não realizadas) que gerarão débito futuro
  const aulasPendentes = await prisma.aula.findMany({
    where: {
      instrutorId: session.user.id,
      modoPagamento: 'PRESENCIAL',
      status: { in: ['AGENDADA', 'CONFIRMADA'] },
    },
    select: { taxaPlataforma: true, totalPago: true, data: true },
  })

  const debitoPendente = aulasPendentes.reduce((sum, a) => sum + a.taxaPlataforma, 0)

  // Aulas via plataforma realizadas (repasse a receber)
  const aulasPlataforma = await prisma.aula.findMany({
    where: {
      instrutorId: session.user.id,
      modoPagamento: 'PLATAFORMA',
      status: 'REALIZADA',
      pagamentoLiberadoEm: null,
    },
    select: { repasseInstrutor: true },
  })

  const repassePendente = aulasPlataforma.reduce((sum, a) => sum + a.repasseInstrutor, 0)

  return NextResponse.json({
    saldoDevedor: perfil.saldoDevedor,          // débito acumulado já registrado
    debitoPendente,                              // débito futuro de aulas presenciais agendadas
    repassePendente,                             // repasse a receber de aulas via plataforma
    saldoLiquido: repassePendente - perfil.saldoDevedor, // positivo = plataforma deve; negativo = instrutor deve
  })
}
