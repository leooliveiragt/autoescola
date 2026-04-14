import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const perfil = await prisma.perfilInstrutor.findUnique({
      where: { userId: session.user.id },
      include: { user: true },
    })

    if (!perfil) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      nome: perfil.user.nome,
      email: perfil.user.email,
      avatarUrl: perfil.user.avatarUrl ?? null,
      precoPorHora: perfil.precoPorHora,
      raioAtendimentoKm: perfil.raioAtendimentoKm,
      mediaAvaliacao: perfil.mediaAvaliacao,
      totalAvaliacoes: perfil.totalAvaliacoes,
      visivel: perfil.visivel,
      bio: perfil.bio ?? '',
      especialidades: perfil.especialidades,
      modoRecebimento: (perfil as any).modoRecebimento,
    })
  } catch (err) {
    console.error('[GET /api/instrutor/perfil]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
