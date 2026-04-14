import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const aulas = await prisma.aula.findMany({
    where: { instrutorId: session.user.id },
    include: { aluno: { select: { id: true, nome: true, email: true, telefone: true, avatarUrl: true } } },
    orderBy: { data: 'desc' },
  })

  return NextResponse.json(aulas)
}
