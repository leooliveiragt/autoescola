import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

interface Params { params: { id: string } }

export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { nome: true, email: true } },
      subscription: true,
    },
  })

  if (!perfil) return NextResponse.json({ error: 'Instrutor não encontrado' }, { status: 404 })
  if (perfil.saldoDevedor <= 0) return NextResponse.json({ error: 'Instrutor não possui débito' }, { status: 400 })

  const stripeKey = process.env.STRIPE_SECRET_KEY ?? ''
  const isDemo = !stripeKey || stripeKey.startsWith('sk_test_...')

  // Modo demo: simula cobrança
  if (isDemo) {
    return NextResponse.json({
      demo: true,
      metodo: 'cartao',
      valor: perfil.saldoDevedor,
      mensagem: 'Modo demonstração — cobrança simulada com sucesso.',
    })
  }

  const stripeCustomerId = perfil.subscription?.stripeCustomerId

  // Tenta cobrar via cartão cadastrado no Stripe
  if (stripeCustomerId) {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: Math.round(perfil.saldoDevedor * 100),
        currency: 'brl',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        confirm: true,
        off_session: true, // cobrança sem o instrutor presente
        metadata: {
          tipo: 'COBRANCA_DEBITO_INSTRUTOR',
          instrutorPerfilId: perfil.id,
          valorCobrado: String(perfil.saldoDevedor),
        },
      })

      if (intent.status === 'succeeded') {
        await prisma.perfilInstrutor.update({
          where: { id: perfil.id },
          data: { saldoDevedor: 0 },
        })
        return NextResponse.json({ metodo: 'cartao', status: 'sucesso', valor: perfil.saldoDevedor })
      }

      // Pagamento incompleto (autenticação necessária, etc.)
      return NextResponse.json({ metodo: 'cartao', status: 'pendente', clientSecret: intent.client_secret })
    } catch (err: any) {
      console.warn(`Cobrança no cartão falhou para instrutor ${perfil.id}:`, err.message)
      // Falha → retorna chave PIX para cobrança manual
    }
  }

  // Fallback: retorna chave PIX para o instrutor pagar manualmente
  const configPix = await prisma.configuracao.findUnique({ where: { chave: 'pix_chave' } })

  return NextResponse.json({
    metodo: 'pix',
    status: 'pendente',
    valor: perfil.saldoDevedor,
    pixChave: configPix?.valor ?? null,
    mensagem: 'Cobrança no cartão falhou. Instrutor deve pagar via PIX.',
  })
}
