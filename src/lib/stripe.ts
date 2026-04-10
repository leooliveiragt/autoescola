import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
  typescript: true,
})

export const PLANOS = {
  mensal: {
    priceId: process.env.STRIPE_PRICE_MENSAL!,
    valor: 49,
    nome: 'Plano Mensal',
    intervalo: 'month' as const,
  },
  anual: {
    priceId: process.env.STRIPE_PRICE_ANUAL!,
    valor: 39,
    nome: 'Plano Anual',
    intervalo: 'year' as const,
  },
}

export async function criarClienteStripe(nome: string, email: string) {
  return stripe.customers.create({ name: nome, email })
}

export async function criarSubscription(
  customerId: string,
  priceId: string
) {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
  })
}

export async function criarPaymentIntent(
  valor: number,
  customerId: string,
  metadata: Record<string, string>
) {
  return stripe.paymentIntents.create({
    amount: Math.round(valor * 100),
    currency: 'brl',
    customer: customerId,
    metadata,
    automatic_payment_methods: { enabled: true },
  })
}

export async function cancelarSubscription(subscriptionId: string) {
  return stripe.subscriptions.cancel(subscriptionId)
}
