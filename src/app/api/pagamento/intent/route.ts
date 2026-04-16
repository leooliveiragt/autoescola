import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { aulaId, metodo } = await req.json()

  if (!aulaId || !metodo) {
    return NextResponse.json({ error: 'aulaId e metodo são obrigatórios' }, { status: 400 })
  }

  const aula = await prisma.aula.findUnique({
    where: { id: aulaId, alunoId: session.user.id },
    include: {
      instrutor: {
        select: { nome: true, perfilInstrutor: { select: { id: true, saldoDevedor: true } } },
      },
    },
  })

  if (!aula) {
    return NextResponse.json({ error: 'Aula não encontrada' }, { status: 404 })
  }

  const perfil = aula.instrutor.perfilInstrutor
  const valorCentavos = Math.round(aula.totalPago * 100)

  // Modo demo: ativo quando a chave Stripe ainda é placeholder
  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
  const isDemo = !stripeKey || stripeKey.startsWith('sk_test_...') || stripeKey === 'sk_test_'

  if (isDemo) {
    if (metodo === 'pix') {
      return NextResponse.json({
        demo: true, clientSecret: null,
        pixQrCodeUrl: null, pixCopiaECola: 'demo@dirigeja.com.br', expiracao: null,
      })
    }
    return NextResponse.json({ demo: true, clientSecret: null })
  }

  // Ao confirmar pagamento via Stripe, o webhook vai:
  // 1. Marcar aula como CONFIRMADA
  // 2. Abater saldo devedor do instrutor (se houver)
  const metadata: Record<string, string> = {
    aulaId: aula.id,
    alunoId: session.user.id,
    instrutorNome: aula.instrutor.nome,
    instrutorPerfilId: perfil?.id ?? '',
    saldoDevedorAtual: String(perfil?.saldoDevedor ?? 0),
    taxaPlataforma: String(aula.taxaPlataforma),
    repasseInstrutor: String(aula.repasseInstrutor),
  }

  if (metodo === 'pix') {
    const intent = await stripe.paymentIntents.create({
      amount: valorCentavos,
      currency: 'brl',
      payment_method_types: ['pix'],
      payment_method_data: { type: 'pix' },
      confirm: true,
      metadata,
    })
    const pix = (intent.next_action as any)?.pix_display_qr_code
    return NextResponse.json({
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      pixQrCodeUrl: pix?.image_url_png ?? null,
      pixCopiaECola: pix?.data ?? null,
      expiracao: pix?.expires_at ?? null,
    })
  }

  if (metodo === 'cartao') {
    const intent = await stripe.paymentIntents.create({
      amount: valorCentavos,
      currency: 'brl',
      payment_method_types: ['card'],
      metadata,
    })
    return NextResponse.json({ clientSecret: intent.client_secret, paymentIntentId: intent.id })
  }

  return NextResponse.json({ error: 'Método de pagamento inválido' }, { status: 400 })
}
