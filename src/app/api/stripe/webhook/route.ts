import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const status = sub.status === 'active' ? 'ATIVA' :
                       sub.status === 'canceled' ? 'CANCELADA' : 'TRIAL'

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: {
            status: status as any,
            inicioEm: new Date(sub.current_period_start * 1000),
            fimEm: new Date(sub.current_period_end * 1000),
          },
        })

        // Make instructor visible when subscription activates
        if (status === 'ATIVA') {
          const dbSub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: sub.id } })
          if (dbSub) {
            await prisma.perfilInstrutor.update({
              where: { id: dbSub.instrutorId },
              data: { visivel: true },
            })
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: 'CANCELADA', canceladoEm: new Date() },
        })

        const dbSub = await prisma.subscription.findUnique({ where: { stripeSubscriptionId: sub.id } })
        if (dbSub) {
          await prisma.perfilInstrutor.update({
            where: { id: dbSub.instrutorId },
            data: { visivel: false },
          })
        }
        break
      }

      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent
        const aulaId = pi.metadata?.aulaId
        if (aulaId) {
          await prisma.aula.update({
            where: { id: aulaId },
            data: { status: 'CONFIRMADA', stripePaymentIntentId: pi.id },
          })
        }
        break
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
