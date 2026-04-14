import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, hora, duracao } = await req.json()

  if (!data || !hora || !duracao) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  // Fetch instructor profile
  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, nome: true, telefone: true } },
      disponibilidades: { where: { ativo: true } },
    },
  })

  if (!perfil || !perfil.visivel) {
    return NextResponse.json({ error: 'Instrutor não encontrado' }, { status: 404 })
  }

  // Validate availability: check that selected day/time falls within a disponibilidade slot
  const dataAula = new Date(`${data}T${hora}:00`)
  const diaSemana = dataAula.getDay() // 0=Sun, 6=Sat
  const horaStr = hora // e.g. "09:00"

  const slotValido = perfil.disponibilidades.some(d => {
    if (d.diaSemana !== diaSemana) return false
    return horaStr >= d.horaInicio && horaStr < d.horaFim
  })

  if (!slotValido) {
    return NextResponse.json({ error: 'Horário não disponível para este instrutor' }, { status: 409 })
  }

  // Check for conflicts (another aula at same time)
  const horaFim = new Date(dataAula)
  horaFim.setHours(horaFim.getHours() + duracao)

  const conflito = await prisma.aula.findFirst({
    where: {
      instrutorId: perfil.userId,
      status: { in: ['AGENDADA', 'CONFIRMADA'] },
      data: { gte: dataAula, lt: horaFim },
    },
  })

  if (conflito) {
    return NextResponse.json({ error: 'Instrutor já possui aula neste horário' }, { status: 409 })
  }

  const precoPorHora = perfil.precoPorHora
  const totalPago = precoPorHora * duracao

  // Create the lesson record
  const aula = await prisma.aula.create({
    data: {
      alunoId: session.user.id,
      instrutorId: perfil.userId,
      data: dataAula,
      duracaoHoras: duracao,
      precoPorHora,
      totalPago,
      status: perfil.modoRecebimento === 'DIRETO' ? 'CONFIRMADA' : 'AGENDADA',
    },
  })

  // Build response
  const responseData: any = {
    aulaId: aula.id,
    modoRecebimento: perfil.modoRecebimento,
    instrutor: { nome: perfil.user.nome },
    data,
    hora,
    duracao,
    precoPorHora,
    totalPago,
    taxaPlataforma: perfil.modoRecebimento === 'PLATAFORMA' ? totalPago * 0.1 : 0,
    totalComTaxa: perfil.modoRecebimento === 'PLATAFORMA' ? totalPago * 1.1 : totalPago,
  }

  // Always include phone — client shows it after payment confirmation
  responseData.telefoneInstrutor = perfil.user.telefone ?? null

  return NextResponse.json(responseData, { status: 201 })
}
