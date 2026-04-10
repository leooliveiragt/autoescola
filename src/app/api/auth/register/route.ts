import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { nome, email, senha, role } = await req.json()

    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando.' }, { status: 400 })
    }

    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 })
    }

    const hash = await bcrypt.hash(senha, 12)

    const user = await prisma.user.create({
      data: {
        nome,
        email,
        senha: hash,
        role: role === 'INSTRUTOR' ? 'INSTRUTOR' : 'ALUNO',
      },
    })

    // If instructor, create empty profile
    if (role === 'INSTRUTOR') {
      await prisma.perfilInstrutor.create({
        data: {
          userId: user.id,
          precoPorHora: 0,
          visivel: false,
        },
      })
    }

    return NextResponse.json({ id: user.id, email: user.email, role: user.role })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Erro interno.' }, { status: 500 })
  }
}
