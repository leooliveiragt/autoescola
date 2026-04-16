import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { precoPorHora, bio, raioAtendimentoKm, modoRecebimento, pixChave } = await req.json()

  const perfil = await prisma.perfilInstrutor.update({
    where: { userId: session.user.id },
    data: {
      ...(precoPorHora && { precoPorHora }),
      ...(bio !== undefined && { bio }),
      ...(raioAtendimentoKm && { raioAtendimentoKm }),
      ...(modoRecebimento && { modoRecebimento }),
      ...(pixChave !== undefined && { pixChave: pixChave || null }),
    } as any,
  })

  return NextResponse.json(perfil)
}
