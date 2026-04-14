import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Returns lessons from the past 24h that don't have a review yet
export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json([], { status: 401 })

  const ontem = new Date()
  ontem.setHours(ontem.getHours() - 24)

  if (session.user.role === 'ALUNO') {
    const aulas = await prisma.aula.findMany({
      where: {
        alunoId: session.user.id,
        status: 'CONFIRMADA',
        data: { gte: ontem, lte: new Date() },
        avaliacao: null,
      },
      include: { instrutor: { select: { nome: true } } },
    })
    return NextResponse.json(aulas)
  }

  if (session.user.role === 'INSTRUTOR') {
    const aulas = await prisma.aula.findMany({
      where: {
        instrutorId: session.user.id,
        status: 'CONFIRMADA',
        data: { gte: ontem, lte: new Date() },
        avaliacaoInstrutor: null,
      },
      include: { aluno: { select: { nome: true } } },
    })
    return NextResponse.json(aulas)
  }

  return NextResponse.json([])
}
