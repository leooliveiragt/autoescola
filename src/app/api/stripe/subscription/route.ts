import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe, PLANOS, criarClienteStripe, criarSubscription } from '@/lib/stripe'

// POST /api/stripe/subscription — create subscription for instructor
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { plano } = await req.json()
  const planoConfig = PLANOS[plano as keyof typeof PLANOS]
  if (!planoConfig) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

    const perfil = await prisma.perfilInstrutor.findUnique({
      where: { userId: session.user.id },
      include: { subscription: true },
    })

    let customerId = perfil?.subscription?.stripeCustomerId

    if (!customerId) {
      const customer = await criarClienteStripe(user.nome, user.email)
      customerId = customer.id
    }

    const subscription = await criarSubscription(customerId, planoConfig.priceId)
    const invoice = (subscription as any).latest_invoice
    const clientSecret = invoice?.payment_intent?.client_secret

    // Save subscription record
    await prisma.subscription.upsert({
      where: { instrutorId: perfil!.id },
      create: {
        instrutorId: perfil!.id,
        stripeCustomerId: customerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId: planoConfig.priceId,
        status: 'TRIAL',
        plano,
        valorMensal: planoConfig.valor,
      },
      update: {
        stripeSubscriptionId: subscription.id,
        stripePriceId: planoConfig.priceId,
        status: 'TRIAL',
        plano,
      },
    })

    return NextResponse.json({ clientSecret, subscriptionId: subscription.id })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao criar assinatura' }, { status: 500 })
  }
}
