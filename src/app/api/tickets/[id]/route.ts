import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { mensagem } = await req.json()
  if (!mensagem?.trim()) return NextResponse.json({ error: 'Mensagem vazia' }, { status: 400 })

  const ticket = await prisma.ticket.findUnique({ where: { id: params.id } })
  if (!ticket) return NextResponse.json({ error: 'Ticket não encontrado' }, { status: 404 })
  if (ticket.autorId !== session.user.id && session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const isAdmin = session.user.role === 'ADMIN'
  const msg = await prisma.ticketMensagem.create({
    data: { ticketId: params.id, autorId: session.user.id, mensagem: mensagem.trim(), isAdmin },
  })

  // Update status when admin replies
  if (isAdmin && ticket.status === 'ABERTO') {
    await prisma.ticket.update({ where: { id: params.id }, data: { status: 'EM_ATENDIMENTO' } })
  }
  await prisma.ticket.update({ where: { id: params.id }, data: { updatedAt: new Date() } })

  return NextResponse.json(msg, { status: 201 })
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  const { status } = await req.json()
  const ticket = await prisma.ticket.update({ where: { id: params.id }, data: { status } })
  return NextResponse.json(ticket)
}
