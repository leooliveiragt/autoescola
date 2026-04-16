import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

const HORAS_LIMITE_CANCELAMENTO = 48

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { aulaId } = await req.json()
  if (!aulaId) return NextResponse.json({ error: 'aulaId obrigatório' }, { status: 400 })

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId },
    select: {
      id: true,
      alunoId: true,
      instrutorId: true,
      data: true,
      status: true,
      modoPagamento: true,
      taxaPlataforma: true,
      totalPago: true,
      stripePaymentIntentId: true,
    },
  })

  if (!aula) return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
  if (aula.alunoId !== session.user.id) return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  if (aula.status === 'CANCELADA') return NextResponse.json({ error: 'Aula já cancelada' }, { status: 400 })
  if (aula.status === 'REALIZADA') return NextResponse.json({ error: 'Aula já realizada — não é possível cancelar' }, { status: 400 })

  // Regra das 48h
  const agora = new Date()
  const horasAteAula = (aula.data.getTime() - agora.getTime()) / (1000 * 60 * 60)
  if (horasAteAula < HORAS_LIMITE_CANCELAMENTO) {
    return NextResponse.json({
      error: `Cancelamento não permitido. A aula ocorre em menos de ${HORAS_LIMITE_CANCELAMENTO}h e não é possível fazer estorno.`,
      code: 'FORA_DO_PRAZO',
    }, { status: 422 })
  }

  // Estorno via Stripe (apenas pagamentos pela plataforma)
  let estorno: 'REALIZADO' | 'NAO_APLICAVEL' | 'FALHOU' = 'NAO_APLICAVEL'

  if (aula.modoPagamento === 'PLATAFORMA' && aula.stripePaymentIntentId) {
    const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
    const isDemo = !stripeKey || stripeKey.startsWith('sk_test_...')

    if (!isDemo) {
      try {
        await stripe.refunds.create({ payment_intent: aula.stripePaymentIntentId })
        estorno = 'REALIZADO'
      } catch (err: any) {
        console.error('[cancelar aula] Estorno falhou:', err.message)
        estorno = 'FALHOU'
        // Mesmo com falha no estorno, cancela a aula e registra para revisão manual
      }
    } else {
      estorno = 'REALIZADO' // demo: simula estorno
    }
  }

  // Cancela a aula
  await prisma.aula.update({
    where: { id: aulaId },
    data: { status: 'CANCELADA' },
  })

  // Se era PRESENCIAL, reduz o saldo devedor do instrutor (a taxa não será mais cobrada)
  if (aula.modoPagamento === 'PRESENCIAL' && aula.taxaPlataforma > 0) {
    await prisma.perfilInstrutor.updateMany({
      where: { userId: aula.instrutorId },
      data: { saldoDevedor: { decrement: aula.taxaPlataforma } },
    })
  }

  return NextResponse.json({ ok: true, estorno })
}
