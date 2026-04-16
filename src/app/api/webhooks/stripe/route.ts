import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('stripe-signature') ?? ''

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    console.error('Webhook signature inválida:', err.message)
    return NextResponse.json({ error: 'Signature inválida' }, { status: 400 })
  }

  // ── Pagamento de AULA confirmado (aluno pagou via plataforma) ──
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as any
    const { aulaId, instrutorPerfilId, saldoDevedorAtual } = intent.metadata ?? {}

    if (!aulaId) {
      // Pode ser cobrança de mensalidade ou débito do instrutor — tratado abaixo
      return NextResponse.json({ received: true })
    }

    const saldoDevedor = parseFloat(saldoDevedorAtual ?? '0')

    // Marca a aula como confirmada e registra o payment intent
    await prisma.aula.update({
      where: { id: aulaId },
      data: { status: 'CONFIRMADA', stripePaymentIntentId: intent.id },
    })

    // Se o instrutor tinha saldo devedor, abate com este pagamento
    if (instrutorPerfilId && saldoDevedor > 0) {
      // A taxa desta aula já está computada no repasseInstrutor.
      // Aqui zeramos o saldo devedor acumulado de aulas presenciais anteriores.
      await prisma.perfilInstrutor.update({
        where: { id: instrutorPerfilId },
        data: { saldoDevedor: 0 },
      })
    }

    console.log(`Aula ${aulaId} confirmada. Saldo devedor abatido: R$${saldoDevedor}`)
  }

  // ── Cobrança de DÉBITO do instrutor (tentativa de cobrar saldo devedor) ──
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as any
    const { tipo, instrutorPerfilId, valorCobrado } = intent.metadata ?? {}

    if (tipo === 'COBRANCA_DEBITO_INSTRUTOR' && instrutorPerfilId) {
      const valor = parseFloat(valorCobrado ?? '0')
      await prisma.perfilInstrutor.update({
        where: { id: instrutorPerfilId },
        data: { saldoDevedor: { decrement: valor } },
      })
      console.log(`Débito de R$${valor} cobrado do instrutor ${instrutorPerfilId}`)
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object as any
    console.warn(`Pagamento falhou: ${intent.id} — ${intent.last_payment_error?.message}`)
  }

  return NextResponse.json({ received: true })
}
