import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const where = session.user.role === 'ADMIN' ? {} : { autorId: session.user.id }
  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      autor: { select: { nome: true, role: true } },
      mensagens: { orderBy: { createdAt: 'asc' }, include: { autor: { select: { nome: true, role: true } } } },
    },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json(tickets)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { titulo, mensagem } = await req.json()
  if (!titulo?.trim() || !mensagem?.trim()) {
    return NextResponse.json({ error: 'Título e mensagem são obrigatórios' }, { status: 400 })
  }

  const ticket = await prisma.ticket.create({
    data: {
      autorId: session.user.id,
      titulo: titulo.trim(),
      mensagens: {
        create: { autorId: session.user.id, mensagem: mensagem.trim(), isAdmin: false },
      },
    },
    include: { mensagens: true },
  })
  return NextResponse.json(ticket, { status: 201 })
}
