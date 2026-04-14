import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_MENSALIDADE = 49

async function getMensalidade(): Promise<number> {
  const config = await prisma.configuracao.findUnique({ where: { chave: 'mensalidade_instrutor' } })
  return config ? parseFloat(config.valor) : DEFAULT_MENSALIDADE
}

// GET — retorna subscription atual + preço configurado
export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })

  const mensalidade = await getMensalidade()

  return NextResponse.json({ subscription: perfil?.subscription ?? null, mensalidade })
}

// POST — assinar via cartão ou PIX
export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const perfil = await prisma.perfilInstrutor.findUnique({ where: { userId: session.user.id } })
  if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

  const mensalidade = await getMensalidade()

  // PIX — cria assinatura TRIAL aguardando confirmação manual
  if (body.metodoPagamento === 'PIX') {
    const subscription = await prisma.subscription.upsert({
      where: { instrutorId: perfil.id },
      create: {
        instrutorId: perfil.id,
        status: 'TRIAL',
        plano: 'mensal',
        valorMensal: mensalidade,
        cartaoBandeira: 'PIX',
        cartaoFinal: null,
        cartaoNome: null,
      },
      update: {
        status: 'TRIAL',
        valorMensal: mensalidade,
        canceladoEm: null,
        cartaoBandeira: 'PIX',
        cartaoFinal: null,
        cartaoNome: null,
      },
    })
    return NextResponse.json({ subscription })
  }

  // Cartão de crédito
  const { cartaoNumero, cartaoValidade, cartaoCvv, cartaoNome } = body
  if (!cartaoNumero || !cartaoValidade || !cartaoCvv || !cartaoNome) {
    return NextResponse.json({ error: 'Dados do cartão incompletos' }, { status: 400 })
  }

  const cartaoFinal = cartaoNumero.replace(/\s/g, '').slice(-4)
  const bandeira = detectarBandeira(cartaoNumero)
  const fimEm = new Date()
  fimEm.setMonth(fimEm.getMonth() + 1)

  const subscription = await prisma.subscription.upsert({
    where: { instrutorId: perfil.id },
    create: {
      instrutorId: perfil.id,
      status: 'ATIVA',
      plano: 'mensal',
      valorMensal: mensalidade,
      inicioEm: new Date(),
      fimEm,
      cartaoFinal,
      cartaoBandeira: bandeira,
      cartaoNome: cartaoNome.toUpperCase(),
    },
    update: {
      status: 'ATIVA',
      valorMensal: mensalidade,
      inicioEm: new Date(),
      fimEm,
      canceladoEm: null,
      cartaoFinal,
      cartaoBandeira: bandeira,
      cartaoNome: cartaoNome.toUpperCase(),
    },
  })

  return NextResponse.json({ subscription })
}

// PATCH — cancelar ou trocar cartão
export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { userId: session.user.id },
    include: { subscription: true },
  })
  if (!perfil?.subscription) {
    return NextResponse.json({ error: 'Assinatura não encontrada' }, { status: 404 })
  }

  // Cancelar
  if (body.acao === 'cancelar') {
    const subscription = await prisma.subscription.update({
      where: { instrutorId: perfil.id },
      data: { status: 'CANCELADA', canceladoEm: new Date() },
    })
    return NextResponse.json({ subscription })
  }

  // Trocar cartão
  if (body.acao === 'trocar_cartao') {
    const { cartaoNumero, cartaoValidade, cartaoCvv, cartaoNome } = body
    if (!cartaoNumero || !cartaoValidade || !cartaoCvv || !cartaoNome) {
      return NextResponse.json({ error: 'Dados do cartão incompletos' }, { status: 400 })
    }
    const cartaoFinal = cartaoNumero.replace(/\s/g, '').slice(-4)
    const bandeira = detectarBandeira(cartaoNumero)
    const subscription = await prisma.subscription.update({
      where: { instrutorId: perfil.id },
      data: { cartaoFinal, cartaoBandeira: bandeira, cartaoNome: cartaoNome.toUpperCase() },
    })
    return NextResponse.json({ subscription })
  }

  return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
}

function detectarBandeira(numero: string): string {
  const n = numero.replace(/\s/g, '')
  if (/^4/.test(n)) return 'Visa'
  if (/^5[1-5]/.test(n)) return 'Mastercard'
  if (/^3[47]/.test(n)) return 'Amex'
  if (/^6(?:011|5)/.test(n)) return 'Discover'
  if (/^(?:2131|1800|35)/.test(n)) return 'JCB'
  if (/^636/.test(n)) return 'Elo'
  return 'Cartão'
}
