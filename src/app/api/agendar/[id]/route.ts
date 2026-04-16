import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { data, hora, duracao, modoPagamento = 'PLATAFORMA' } = await req.json()

  if (!data || !hora || !duracao) {
    return NextResponse.json({ error: 'Dados incompletos' }, { status: 400 })
  }

  if (!['PLATAFORMA', 'PRESENCIAL'].includes(modoPagamento)) {
    return NextResponse.json({ error: 'modoPagamento inválido' }, { status: 400 })
  }

  const [perfil, configTaxa] = await Promise.all([
    prisma.perfilInstrutor.findUnique({
      where: { id: params.id },
      include: {
        user: { select: { id: true, nome: true, telefone: true } },
        disponibilidades: { where: { ativo: true } },
      },
    }),
    prisma.configuracao.findUnique({ where: { chave: 'taxa_plataforma' } }),
  ])

  if (!perfil || !perfil.visivel) {
    return NextResponse.json({ error: 'Instrutor não encontrado' }, { status: 404 })
  }

  // Valida disponibilidade
  const dataAula = new Date(`${data}T${hora}:00`)
  const diaSemana = dataAula.getDay()
  const horaStr = hora

  const slotValido = perfil.disponibilidades.some(d => {
    if (d.diaSemana !== diaSemana) return false
    return horaStr >= d.horaInicio && horaStr < d.horaFim
  })

  if (!slotValido) {
    return NextResponse.json({ error: 'Horário não disponível para este instrutor' }, { status: 409 })
  }

  // Verifica conflito de agenda
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

  // Calcula valores financeiros
  const taxaPct = Number(configTaxa?.valor ?? '10') / 100
  const totalPago = perfil.precoPorHora * duracao
  const taxaPlataforma = parseFloat((totalPago * taxaPct).toFixed(2))
  const repasseInstrutor = parseFloat((totalPago - taxaPlataforma).toFixed(2))

  // Cria a aula
  const aula = await prisma.aula.create({
    data: {
      alunoId: session.user.id,
      instrutorId: perfil.userId,
      data: dataAula,
      duracaoHoras: duracao,
      precoPorHora: perfil.precoPorHora,
      totalPago,
      taxaPlataforma,
      repasseInstrutor,
      modoPagamento,
      // Presencial → agendada (paga na hora); Plataforma → aguarda pagamento
      status: modoPagamento === 'PRESENCIAL' ? 'CONFIRMADA' : 'AGENDADA',
    },
  })

  // Se for pagamento presencial, a plataforma não recebe agora:
  // adiciona a taxa ao saldo devedor do instrutor
  if (modoPagamento === 'PRESENCIAL') {
    await prisma.perfilInstrutor.update({
      where: { id: params.id },
      data: { saldoDevedor: { increment: taxaPlataforma } },
    })
  }

  const responseData: any = {
    aulaId: aula.id,
    modoPagamento,
    totalPago,
    taxaPlataforma,
    repasseInstrutor,
    instrutor: { nome: perfil.user.nome },
    data,
    hora,
    duracao,
  }

  // Telefone revelado imediatamente para pagamento presencial
  if (modoPagamento === 'PRESENCIAL') {
    responseData.telefoneInstrutor = perfil.user.telefone ?? null
  }

  return NextResponse.json(responseData, { status: 201 })
}
