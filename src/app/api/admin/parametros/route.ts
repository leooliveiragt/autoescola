import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULTS: Record<string, string> = {
  taxa_plataforma: '10',
  mensalidade_instrutor: '14.90',
  repasse_instrutor: '90',
  pix_chave: '',
}

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const configs = await prisma.configuracao.findMany()
  const result: Record<string, string> = { ...DEFAULTS }
  for (const c of configs) result[c.chave] = c.valor
  return NextResponse.json(result)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const allowed = ['taxa_plataforma', 'mensalidade_instrutor', 'repasse_instrutor', 'pix_chave']

  for (const [chave, valor] of Object.entries(body)) {
    if (!allowed.includes(chave)) continue
    await prisma.configuracao.upsert({
      where: { chave },
      update: { valor: String(valor) },
      create: { chave, valor: String(valor) },
    })
  }

  return NextResponse.json({ ok: true })
}
