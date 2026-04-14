import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { enviarWhatsapp, msgBoasVindas, msgReprovado } from '@/lib/whatsapp'

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

  if (status === 'REJEITADO' && !observacao?.trim()) {
    return NextResponse.json({ error: 'Informe o motivo da reprovação.' }, { status: 400 })
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

  // On approval: activate user + make instructor visible + WhatsApp
  if (status === 'APROVADO') {
    await prisma.user.update({ where: { id: kyc.userId }, data: { ativo: true } })

    if (kyc.user.role === 'INSTRUTOR') {
      const perfil = await prisma.perfilInstrutor.findUnique({
        where: { userId: kyc.userId },
        include: { subscription: true },
      })
      if (perfil) {
        // Always make the instructor visible on KYC approval
        await prisma.perfilInstrutor.update({
          where: { userId: kyc.userId },
          data: { visivel: true },
        })
        // Create TRIAL subscription if none exists
        if (!perfil.subscription) {
          await prisma.subscription.create({
            data: { instrutorId: perfil.id, status: 'TRIAL' },
          })
        }
      }
    }

    if (kyc.user.telefone) {
      await enviarWhatsapp(
        kyc.user.telefone,
        msgBoasVindas(kyc.user.nome, kyc.user.role as 'INSTRUTOR' | 'ALUNO'),
      )
    }
  }

  // On rejection: WhatsApp with reason + resubmission link
  if (status === 'REJEITADO' && kyc.user.telefone) {
    await enviarWhatsapp(
      kyc.user.telefone,
      msgReprovado(kyc.user.nome, observacao ?? 'Documentos ilegíveis ou inválidos.', kyc.userId),
    )
  }

  return NextResponse.json(kyc)
}
