import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const MAX = 6

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { especialidades } = await req.json()

    if (!Array.isArray(especialidades)) {
      return NextResponse.json({ error: 'Formato inválido' }, { status: 400 })
    }

    if (especialidades.length > MAX) {
      return NextResponse.json({ error: `Máximo de ${MAX} especialidades permitidas` }, { status: 400 })
    }

    const clean = especialidades
      .map((e: unknown) => String(e).trim())
      .filter(e => e.length > 0)
      .slice(0, MAX)

    const perfil = await prisma.perfilInstrutor.update({
      where: { userId: session.user.id },
      data: { especialidades: clean },
    })

    return NextResponse.json({ especialidades: perfil.especialidades })
  } catch (err) {
    console.error('[PATCH /api/instrutor/especialidades]', err)
    return NextResponse.json({ error: 'Erro ao salvar especialidades' }, { status: 500 })
  }
}
