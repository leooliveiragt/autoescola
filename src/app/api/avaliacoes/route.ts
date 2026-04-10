import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { aulaId, alvoId, nota, comentario } = await req.json()

  if (!aulaId || !alvoId || !nota) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  if (nota < 1 || nota > 5) {
    return NextResponse.json({ error: 'Nota inválida' }, { status: 400 })
  }

  // Verify aula exists and user participated
  const aula = await prisma.aula.findUnique({ where: { id: aulaId } })
  if (!aula) return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })

  const isParticipant = aula.alunoId === session.user.id || aula.instrutorId === session.user.id
  if (!isParticipant) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })

  // Check already reviewed
  const existing = await prisma.avaliacao.findUnique({ where: { aulaId } })
  if (existing) return NextResponse.json({ error: 'Aula já avaliada' }, { status: 409 })

  const avaliacao = await prisma.avaliacao.create({
    data: { aulaId, autorId: session.user.id, alvoId, nota, comentario },
  })

  // Update average rating for instructor
  const instrutorId = aula.instrutorId
  const todasAvaliacoes = await prisma.avaliacao.findMany({
    where: { alvoId: instrutorId },
    select: { nota: true },
  })
  const media = todasAvaliacoes.reduce((acc, a) => acc + a.nota, 0) / todasAvaliacoes.length

  await prisma.perfilInstrutor.updateMany({
    where: { userId: instrutorId },
    data: {
      mediaAvaliacao: Math.round(media * 10) / 10,
      totalAvaliacoes: todasAvaliacoes.length,
    },
  })

  return NextResponse.json(avaliacao)
}
