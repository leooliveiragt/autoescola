import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET — list weekly payments pending release
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Last completed week: Mon–Sun
  const hoje = new Date()
  const diaSemana = hoje.getDay() // 0=Sun
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
      instrutor: {
        perfilInstrutor: { modoRecebimento: 'PLATAFORMA' } as any,
      },
    },
    include: {
      aluno: { select: { nome: true } },
      instrutor: {
        select: { nome: true, perfilInstrutor: true },
      },
      reclamacao: true,
    },
    orderBy: { data: 'asc' },
  })

  return NextResponse.json(aulas)
}

// PATCH — release a specific payment
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { aulaId } = await req.json()
  const aula = await prisma.aula.findUnique({ where: { id: aulaId }, include: { reclamacao: true } })
  if (!aula) return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
  if (aula.reclamacao?.status === 'ABERTA' || aula.reclamacao?.status === 'EM_ANALISE') {
    return NextResponse.json({ error: 'Existe uma reclamação em aberto para esta aula' }, { status: 409 })
  }

  await prisma.aula.update({ where: { id: aulaId }, data: { pagamentoLiberadoEm: new Date() } })
  return NextResponse.json({ ok: true })
}
