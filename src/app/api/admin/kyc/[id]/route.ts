import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { status, observacao } = await req.json()
  const validStatuses = ['APROVADO', 'REJEITADO', 'EM_ANALISE']

  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  const kyc = await prisma.kYC.update({
    where: { id: params.id },
    data: {
      status,
      observacaoAdmin: observacao,
      analisadoEm: new Date(),
      analisadoPor: session.user.id,
    },
    include: { user: true },
  })

  // If instructor KYC approved and subscription active, make visible
  if (status === 'APROVADO' && kyc.user.role === 'INSTRUTOR') {
    const perfil = await prisma.perfilInstrutor.findUnique({
      where: { userId: kyc.userId },
      include: { subscription: true },
    })
    if (perfil?.subscription?.status === 'ATIVA') {
      await prisma.perfilInstrutor.update({
        where: { userId: kyc.userId },
        data: { visivel: true },
      })
    }
  }

  return NextResponse.json(kyc)
}
