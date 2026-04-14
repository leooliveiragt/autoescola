import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getPerfil(userId: string) {
  let perfil = await prisma.perfilInstrutor.findUnique({ where: { userId } })
  if (!perfil) {
    // Auto-create profile if instructor registered before this feature
    perfil = await prisma.perfilInstrutor.create({
      data: { userId, precoPorHora: 0, transmissoes: [], especialidades: [] },
    })
  }
  return perfil
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }
    const perfil = await prisma.perfilInstrutor.findUnique({
      where: { userId: session.user.id },
      include: { veiculo: true },
    })
    return NextResponse.json(perfil?.veiculo ?? null)
  } catch (err) {
    console.error('[GET veiculo]', err)
    return NextResponse.json({ error: 'Erro ao buscar veículo' }, { status: 500 })
  }
}

// ─── PUT (create or update) ───────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { placa, marca, modelo, ano, cor, cambio, opcionais, crlvUrl } = body

    const perfil = await getPerfil(session.user.id)

    // Use explicit find → create/update to avoid upsert quirks
    const existing = await prisma.veiculo.findUnique({ where: { instrutorId: perfil.id } })

    let veiculo
    if (existing) {
      veiculo = await prisma.veiculo.update({
        where: { id: existing.id },
        data: {
          placa: placa ?? existing.placa,
          marca: marca ?? existing.marca,
          modelo: modelo ?? existing.modelo,
          ano: ano !== undefined ? Number(ano) : existing.ano,
          cor: cor ?? existing.cor,
          cambio: cambio ?? existing.cambio,
          opcionais: opcionais ?? existing.opcionais,
          crlvUrl: crlvUrl !== undefined ? crlvUrl : existing.crlvUrl,
        },
      })
    } else {
      veiculo = await prisma.veiculo.create({
        data: {
          instrutorId: perfil.id,
          placa: placa ?? '',
          marca: marca ?? '',
          modelo: modelo ?? '',
          ano: Number(ano) || new Date().getFullYear(),
          cor: cor ?? '',
          cambio: cambio ?? 'manual',
          opcionais: opcionais ?? [],
          crlvUrl: crlvUrl ?? null,
          ativo: true,
        },
      })
    }

    return NextResponse.json(veiculo)
  } catch (err) {
    console.error('[PUT veiculo] erro:', err)
    return NextResponse.json({ error: 'Erro ao salvar veículo. Tente novamente.' }, { status: 500 })
  }
}

// ─── PATCH (toggle ativo) ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { ativo } = await req.json()
    const perfil = await getPerfil(session.user.id)

    const veiculo = await prisma.veiculo.update({
      where: { instrutorId: perfil.id },
      data: { ativo: Boolean(ativo) },
    })

    return NextResponse.json(veiculo)
  } catch (err) {
    console.error('[PATCH veiculo]', err)
    return NextResponse.json({ error: 'Erro ao atualizar status' }, { status: 500 })
  }
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
export async function DELETE() {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'INSTRUTOR') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const perfil = await prisma.perfilInstrutor.findUnique({ where: { userId: session.user.id } })
    if (!perfil) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })

    await prisma.veiculo.delete({ where: { instrutorId: perfil.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE veiculo]', err)
    return NextResponse.json({ error: 'Erro ao excluir veículo' }, { status: 500 })
  }
}
