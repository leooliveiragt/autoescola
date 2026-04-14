import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { nome, email, telefone, cpf } = await req.json()

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(nome && { nome }),
      ...(email && { email }),
      ...(telefone !== undefined && { telefone }),
      ...(cpf !== undefined && { cpf }),
    },
  })

  return NextResponse.json({ ok: true, user })
}
