import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { haversineKm } from '@/lib/cep'

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
  const modoPagamento = searchParams.get('modoPagamento') || ''
  // Proximity params
  const alunoLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null
  const alunoLon = searchParams.get('lon') ? parseFloat(searchParams.get('lon')!) : null
  const distanciaMaximaKm = searchParams.get('distanciaMaximaKm')
    ? parseInt(searchParams.get('distanciaMaximaKm')!)
    : null

  const where: any = {
    visivel: true,
    precoPorHora: { lte: precoMaximo },
    ...(avaliacaoMinima > 0 && { mediaAvaliacao: { gte: avaliacaoMinima } }),
    ...(especialidades.length > 0 && { especialidades: { hasSome: especialidades } }),
    ...(modoPagamento && { modoRecebimento: modoPagamento }),
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

  let instrutores = await prisma.perfilInstrutor.findMany({
    where,
    include: {
      user: {
        include: {
          enderecos: { where: { principal: true }, take: 1 },
        },
      },
    },
    orderBy,
  })

  // Proximity filtering + distance annotation
  type InstrutorComDistancia = (typeof instrutores)[number] & { distanciaKm: number | null }

  let resultado: InstrutorComDistancia[]

  if (alunoLat !== null && alunoLon !== null) {
    const annotated: InstrutorComDistancia[] = instrutores.map(inst => {
      const addr = inst.user.enderecos?.[0]
      const distanciaKm =
        addr?.lat && addr?.lng
          ? haversineKm(alunoLat, alunoLon, addr.lat, addr.lng)
          : null
      return { ...inst, distanciaKm }
    })

    resultado = annotated.filter(inst => {
      // Must be within the instructor's coverage radius
      if (inst.distanciaKm === null) return false
      if (inst.distanciaKm > inst.raioAtendimentoKm) return false
      // Optional student-side distance cap
      if (distanciaMaximaKm !== null && inst.distanciaKm > distanciaMaximaKm) return false
      return true
    })

    if (ordenacao === 'distancia') {
      resultado.sort((a, b) => (a.distanciaKm ?? 9999) - (b.distanciaKm ?? 9999))
    }
  } else {
    resultado = instrutores.map(inst => ({ ...inst, distanciaKm: null }))
  }

  const total = resultado.length
  const paginated = resultado.slice((pagina - 1) * limite, pagina * limite)

  return NextResponse.json({ instrutores: paginated, total, pagina, limite })
}
