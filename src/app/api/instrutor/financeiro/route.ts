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

  // Auto-marcar como REALIZADA aulas passadas que ainda estão AGENDADA/CONFIRMADA
  await prisma.aula.updateMany({
    where: {
      instrutorId: session.user.id,
      status: { in: ['AGENDADA', 'CONFIRMADA'] },
      data: { lt: new Date() },
    },
    data: { status: 'REALIZADA' },
  })

  // Corrigir aulas antigas sem taxaPlataforma/repasseInstrutor calculados (criadas antes das colunas existirem)
  await prisma.$executeRaw`
    UPDATE "Aula"
    SET
      "taxaPlataforma"   = ROUND(("totalPago" * 0.10)::numeric, 2),
      "repasseInstrutor" = ROUND(("totalPago" * 0.90)::numeric, 2)
    WHERE
      "instrutorId"      = ${session.user.id}
      AND "modoPagamento" = 'PLATAFORMA'
      AND "taxaPlataforma" = 0
      AND "totalPago"    > 0
  `

  const aulas = await prisma.aula.findMany({
    where: { instrutorId: session.user.id },
    include: {
      aluno: { select: { nome: true, avatarUrl: true } },
    },
    orderBy: { data: 'desc' },
  })

  // ── Via plataforma ──────────────────────────────────────────
  const plataformaRealizadas = aulas.filter(
    a => a.modoPagamento === 'PLATAFORMA' && a.status === 'REALIZADA'
  )
  const plataformaAguardando = aulas.filter(
    a => a.modoPagamento === 'PLATAFORMA' && a.status === 'REALIZADA' && !a.pagamentoLiberadoEm
  )
  const plataformaLiberadas = aulas.filter(
    a => a.modoPagamento === 'PLATAFORMA' && a.status === 'REALIZADA' && !!a.pagamentoLiberadoEm
  )
  const plataformaAgendadas = aulas.filter(
    a => a.modoPagamento === 'PLATAFORMA' && (a.status === 'AGENDADA' || a.status === 'CONFIRMADA')
  )

  // ── Presencial ──────────────────────────────────────────────
  const presencialRealizadas = aulas.filter(
    a => a.modoPagamento === 'PRESENCIAL' && a.status === 'REALIZADA'
  )
  const presencialAgendadas = aulas.filter(
    a => a.modoPagamento === 'PRESENCIAL' && (a.status === 'AGENDADA' || a.status === 'CONFIRMADA')
  )

  const soma = (list: typeof aulas, campo: 'totalPago' | 'taxaPlataforma' | 'repasseInstrutor') =>
    list.reduce((s, a) => {
      let val = a[campo] as number
      // Fallback para aulas antigas onde os campos financeiros ainda são 0
      if (val === 0 && a.totalPago > 0 && a.modoPagamento === 'PLATAFORMA') {
        if (campo === 'taxaPlataforma') val = parseFloat((a.totalPago * 0.10).toFixed(2))
        if (campo === 'repasseInstrutor') val = parseFloat((a.totalPago * 0.90).toFixed(2))
      }
      return s + val
    }, 0)

  return NextResponse.json({
    // Saldo
    saldoDevedor: perfil.saldoDevedor,
    repassePendente: soma(plataformaAguardando, 'repasseInstrutor'),
    saldoLiquido: soma(plataformaAguardando, 'repasseInstrutor') - perfil.saldoDevedor,

    // Via plataforma
    plataforma: {
      totalAulas: plataformaRealizadas.length + plataformaAgendadas.length,
      aulasRealizadas: plataformaRealizadas.length,
      aulasAgendadas: plataformaAgendadas.length,
      brutoRecebido: soma(plataformaRealizadas, 'totalPago'),
      taxaTotal: soma(plataformaRealizadas, 'taxaPlataforma'),
      repasseLiquidoRecebido: soma(plataformaLiberadas, 'repasseInstrutor'),
      repasseAguardando: soma(plataformaAguardando, 'repasseInstrutor'),
    },

    // Presencial
    presencial: {
      totalAulas: presencialRealizadas.length + presencialAgendadas.length,
      aulasRealizadas: presencialRealizadas.length,
      aulasAgendadas: presencialAgendadas.length,
      valorRecebidoDireto: soma(presencialRealizadas, 'totalPago'),
      taxaDevidaPlataforma: perfil.saldoDevedor,
      taxaPendenteFutura: soma(presencialAgendadas, 'taxaPlataforma'),
    },

    // Histórico detalhado
    historico: aulas.map(a => {
      const taxa = a.taxaPlataforma > 0 || a.totalPago === 0
        ? a.taxaPlataforma
        : parseFloat((a.totalPago * 0.10).toFixed(2))
      const repasse = a.repasseInstrutor > 0 || a.totalPago === 0
        ? a.repasseInstrutor
        : parseFloat((a.totalPago * 0.90).toFixed(2))
      return {
        id: a.id,
        data: a.data,
        status: a.status,
        modoPagamento: a.modoPagamento,
        alunoNome: a.aluno.nome,
        alunoAvatar: a.aluno.avatarUrl,
        totalPago: a.totalPago,
        taxaPlataforma: taxa,
        repasseInstrutor: repasse,
        pagamentoLiberadoEm: a.pagamentoLiberadoEm,
      }
    }),
  })
}
