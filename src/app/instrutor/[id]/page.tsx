import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { InstructorProfileClient } from '@/components/instrutor/instructor-profile-client'

interface Props {
  params: { id: string }
}

export default async function InstructorProfilePage({ params }: Props) {
  const session = await auth()
  if (!session) redirect('/login?redirect=/buscar')

  const perfil = await prisma.perfilInstrutor.findUnique({
    where: { id: params.id },
    include: {
      user: {
        include: {
          enderecos: { where: { principal: true }, take: 1 },
          kyc: true,
        },
      },
      disponibilidades: { where: { ativo: true }, orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }] },
      veiculo: true,
    },
  })

  if (!perfil || !perfil.visivel) notFound()

  const avaliacoes = await prisma.avaliacao.findMany({
    where: { alvoId: perfil.userId },
    include: { autor: { select: { nome: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <InstructorProfileClient perfil={perfil as any} avaliacoes={avaliacoes as any} />
    </div>
  )
}
