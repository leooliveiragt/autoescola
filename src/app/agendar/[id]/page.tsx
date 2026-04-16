import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { AgendarClient } from '@/components/instrutor/agendar-client'

interface Props {
  params: { id: string }
  searchParams: { data?: string; hora?: string; duracao?: string }
}

export default async function AgendarPage({ params, searchParams }: Props) {
  const session = await auth()
  if (!session) redirect('/login')

  const { data, hora, duracao } = searchParams
  if (!data || !hora || !duracao) redirect(`/instrutor/${params.id}`)

  const [perfil, configPix] = await Promise.all([
    prisma.perfilInstrutor.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: { nome: true, avatarUrl: true, genero: true, telefone: true },
        },
        veiculo: true,
      },
    }),
    prisma.configuracao.findUnique({ where: { chave: 'pix_chave' } }),
  ])

  if (!perfil || !perfil.visivel) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <AgendarClient
        perfilId={params.id}
        pixChave={configPix?.valor ?? ''}
        instrutor={{
          nome: perfil.user.nome,
          avatarUrl: perfil.user.avatarUrl ?? null,
          genero: perfil.user.genero ?? null,
          precoPorHora: perfil.precoPorHora,
          modoRecebimento: perfil.modoRecebimento as 'PLATAFORMA' | 'DIRETO',
          veiculo: perfil.veiculo
            ? { marca: perfil.veiculo.marca, modelo: perfil.veiculo.modelo, ano: perfil.veiculo.ano, cor: perfil.veiculo.cor, cambio: perfil.veiculo.cambio }
            : null,
        }}
        data={data}
        hora={hora}
        duracao={Number(duracao)}
      />
    </div>
  )
}
