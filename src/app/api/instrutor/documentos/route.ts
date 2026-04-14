import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const kyc = await prisma.kYC.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(kyc)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { docFrenteUrl, docVersoUrl, comprovanteUrl, selfieUrl } = await req.json()

  const kyc = await prisma.kYC.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      status: 'PENDENTE',
      docFrenteUrl: docFrenteUrl ?? null,
      docVersoUrl: docVersoUrl ?? null,
      comprovanteUrl: comprovanteUrl ?? null,
      selfieUrl: selfieUrl ?? null,
    },
    update: {
      ...(docFrenteUrl !== undefined && { docFrenteUrl }),
      ...(docVersoUrl !== undefined && { docVersoUrl }),
      ...(comprovanteUrl !== undefined && { comprovanteUrl }),
      ...(selfieUrl !== undefined && { selfieUrl }),
      // Reset to PENDENTE if any document is updated
      status: 'PENDENTE',
    },
  })

  return NextResponse.json(kyc)
}
