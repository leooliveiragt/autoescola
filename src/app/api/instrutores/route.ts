import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const genero = searchParams.get('genero') || ''
  const avaliacaoMinima = parseFloat(searchParams.get('avaliacaoMinima') || '0')
  const precoMaximo = parseFloat(searchParams.get('precoMaximo') || '9999')
  const especialidades = searchParams.get('especialidades')?.split(',').filter(Boolean) || []
  const ordenacao = searchParams.get('ordenacao') || 'relevancia'
  const pagina = parseInt(searchParams.get('pagina') || '1')
  const limite = parseInt(searchParams.get('limite') || '12')
  const q = searchParams.get('q') || ''

  const where: any = {
    visivel: true,
    precoPorHora: { lte: precoMaximo },
    ...(avaliacaoMinima > 0 && { mediaAvaliacao: { gte: avaliacaoMinima } }),
    ...(especialidades.length > 0 && { especialidades: { hasSome: especialidades } }),
    user: {
      ativo: true,
      ...(genero && { genero }),
      ...(q && {
        OR: [
          { nome: { contains: q, mode: 'insensitive' } },
          { enderecos: { some: { cidade: { contains: q, mode: 'insensitive' } } } },
          { enderecos: { some: { bairro: { contains: q, mode: 'insensitive' } } } },
        ],
      }),
    },
  }

  const orderBy: any =
    ordenacao === 'avaliacao' ? { mediaAvaliacao: 'desc' } :
    ordenacao === 'preco_asc' ? { precoPorHora: 'asc' } :
    ordenacao === 'preco_desc' ? { precoPorHora: 'desc' } :
    { mediaAvaliacao: 'desc' }

  const [instrutores, total] = await Promise.all([
    prisma.perfilInstrutor.findMany({
      where,
      include: {
        user: {
          include: {
            enderecos: { where: { principal: true }, take: 1 },
          },
        },
      },
      orderBy,
      skip: (pagina - 1) * limite,
      take: limite,
    }),
    prisma.perfilInstrutor.count({ where }),
  ])

  return NextResponse.json({ instrutores, total, pagina, limite })
}
