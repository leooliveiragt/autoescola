import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const aulas = await prisma.aula.findMany({
    where: { alunoId: session.user.id },
    include: {
      instrutor: {
        select: { id: true, nome: true, telefone: true, avatarUrl: true },
      },
    },
    orderBy: { data: 'desc' },
  })

  // Attach perfilInstrutor.id for profile link
  const aulasComPerfil = await Promise.all(
    aulas.map(async a => {
      const perfil = await prisma.perfilInstrutor.findUnique({
        where: { userId: a.instrutorId },
        select: { id: true },
      })
      return { ...a, perfilId: perfil?.id ?? null }
    })
  )

  return NextResponse.json(aulasComPerfil)
}
