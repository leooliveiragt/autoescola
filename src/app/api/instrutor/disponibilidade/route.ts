import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { userId: session.user.id },
    include: { disponibilidades: { orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }] } },
  })

  return NextResponse.json(perfil?.disponibilidades ?? [])
}

export async function PUT(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const slots: { diaSemana: number; horaInicio: string; horaFim: string }[] = await req.json()

  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { userId: session.user.id },
  })

  if (!perfil) {
    return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
  }

  // Replace all slots atomically
  await prisma.$transaction([
    prisma.disponibilidade.deleteMany({ where: { instrutorId: perfil.id } }),
    prisma.disponibilidade.createMany({
      data: slots.map(s => ({
        instrutorId: perfil.id,
        diaSemana: s.diaSemana,
        horaInicio: s.horaInicio,
        horaFim: s.horaFim,
        ativo: true,
      })),
    }),
  ])

  const updated = await prisma.disponibilidade.findMany({
    where: { instrutorId: perfil.id },
    orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
  })

  return NextResponse.json(updated)
}
