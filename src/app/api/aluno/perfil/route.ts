import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      cpf: true,
      avatarUrl: true,
      createdAt: true,
      kyc: { select: { status: true } },
      enderecos: {
        select: {
          logradouro: true,
          numero: true,
          bairro: true,
          cidade: true,
          estado: true,
          cep: true,
        },
      },
    },
  })

  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  return NextResponse.json(user)
}

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { nome, telefone, cpf } = body

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(nome !== undefined && { nome }),
      ...(telefone !== undefined && { telefone }),
      ...(cpf !== undefined && { cpf }),
    },
    select: {
      id: true,
      nome: true,
      email: true,
      telefone: true,
      cpf: true,
      avatarUrl: true,
    },
  })

  return NextResponse.json(updated)
}
