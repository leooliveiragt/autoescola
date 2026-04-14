import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { ativo } = await req.json()

  // params.id is the PerfilInstrutor.id
  const perfil = await prisma.perfilInstrutor.findUnique({ where: { id: params.id } })
  if (!perfil) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.$transaction([
    prisma.user.update({ where: { id: perfil.userId }, data: { ativo } }),
    prisma.perfilInstrutor.update({ where: { id: params.id }, data: { visivel: ativo ? undefined : false } }),
  ])

  return NextResponse.json({ ok: true })
}
