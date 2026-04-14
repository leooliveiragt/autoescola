import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { AssinaturaClient } from '@/components/instrutor/assinatura-client'

export const dynamic = 'force-dynamic'

const DEFAULT_MENSALIDADE = 14.90

export default async function InstructorAssinaturaPage() {
  const session = await auth()
  if (!session || session.user.role !== 'INSTRUTOR') redirect('/login')

  const [perfil, configMensalidade, configPix] = await Promise.all([
    prisma.perfilInstrutor.findUnique({
      where: { userId: session.user.id },
      include: { subscription: true },
    }),
    prisma.configuracao.findUnique({ where: { chave: 'mensalidade_instrutor' } }),
    prisma.configuracao.findUnique({ where: { chave: 'pix_chave' } }),
  ])

  const mensalidade = configMensalidade ? parseFloat(configMensalidade.valor) : DEFAULT_MENSALIDADE
  const pixChave = configPix?.valor ?? ''

  return <AssinaturaClient subscription={perfil?.subscription ?? null} mensalidade={mensalidade} pixChave={pixChave} />
}
