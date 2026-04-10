import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const {
    cpf, telefone, dataNascimento, genero,
    cep, logradouro, numero, bairro, cidade, estado,
    cnhEAR, precoPorHora, bio,
  } = body

  try {
    // Update user basic data
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        cpf: cpf || undefined,
        telefone: telefone || undefined,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        genero: genero || undefined,
      },
    })

    // Create/update address
    if (cidade || cep) {
      const existingAddr = await prisma.endereco.findFirst({
        where: { userId: session.user.id, principal: true },
      })

      if (existingAddr) {
        await prisma.endereco.update({
          where: { id: existingAddr.id },
          data: { cep, logradouro, numero, bairro, cidade, estado },
        })
      } else {
        await prisma.endereco.create({
          data: {
            userId: session.user.id,
            cep: cep || '',
            logradouro: logradouro || '',
            numero: numero || '',
            bairro: bairro || '',
            cidade: cidade || '',
            estado: estado || '',
            principal: true,
          },
        })
      }
    }

    // Create KYC record
    await prisma.kYC.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, status: 'PENDENTE' },
      update: { status: 'PENDENTE', updatedAt: new Date() },
    })

    // Update instructor profile if applicable
    if (session.user.role === 'INSTRUTOR' && (cnhEAR || precoPorHora || bio)) {
      await prisma.perfilInstrutor.update({
        where: { userId: session.user.id },
        data: {
          cnhEAR: cnhEAR || undefined,
          precoPorHora: precoPorHora ? parseFloat(precoPorHora) : undefined,
          bio: bio || undefined,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro ao salvar dados' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const kyc = await prisma.kYC.findUnique({ where: { userId: session.user.id } })
  return NextResponse.json(kyc)
}
