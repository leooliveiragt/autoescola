import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { aulaId, descricao } = await req.json()
  if (!aulaId || !descricao?.trim()) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // Validate user is the student of this aula
  const aula = await prisma.aula.findUnique({ where: { id: aulaId } })
  if (!aula) return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
  if (aula.alunoId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const reclamacao = await prisma.reclamacao.upsert({
    where: { aulaId },
    update: { descricao: descricao.trim(), status: 'ABERTA' },
    create: { aulaId, autorId: session.user.id, descricao: descricao.trim() },
  })

  return NextResponse.json(reclamacao, { status: 201 })
}
