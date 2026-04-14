// Instructor evaluates a student after a lesson
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { aulaId, nota, comentario } = await req.json()
  if (!aulaId || !nota) return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  if (nota < 1 || nota > 5) return NextResponse.json({ error: 'Nota inválida' }, { status: 400 })

  const aula = await prisma.aula.findUnique({ where: { id: aulaId } })
  if (!aula) return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
  if (aula.instrutorId !== session.user.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const av = await prisma.avaliacaoInstrutor.upsert({
    where: { aulaId },
    update: { nota, comentario },
    create: { aulaId, instrutorId: session.user.id, alunoId: aula.alunoId, nota, comentario },
  })
  return NextResponse.json(av, { status: 201 })
}
