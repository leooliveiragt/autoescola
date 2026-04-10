import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminSenha = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@dirigeja.com.br' },
    update: {},
    create: {
      nome: 'Admin DirigêJá',
      email: 'admin@dirigeja.com.br',
      senha: adminSenha,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin criado:', admin.email)

  // Sample instructors
  const instrutores = [
    {
      nome: 'Carlos Mendes',
      email: 'carlos@dirigeja.com.br',
      genero: 'M',
      cidade: 'São José dos Campos',
      estado: 'SP',
      lat: -23.1794,
      lng: -45.8847,
      bio: 'Instrutor há 8 anos com mais de 300 alunos aprovados. Especialista em alunos com ansiedade ao volante.',
      precoPorHora: 120,
      cnhEAR: 'EAR-001234',
      anosExperiencia: 8,
      totalAlunos: 300,
      taxaAprovacao: 94,
      mediaAvaliacao: 4.9,
      totalAvaliacoes: 47,
      especialidades: ['Ansiedade ao volante', 'Baliza', 'Manual', 'Iniciantes'],
      transmissoes: ['Manual', 'Automático'],
    },
    {
      nome: 'Juliana Santos',
      email: 'juliana@dirigeja.com.br',
      genero: 'F',
      cidade: 'São José dos Campos',
      estado: 'SP',
      lat: -23.1894,
      lng: -45.8947,
      bio: 'Instrutora especializada em mulheres e pessoas com ansiedade. Método gentil e eficaz.',
      precoPorHora: 130,
      cnhEAR: 'EAR-002345',
      anosExperiencia: 5,
      totalAlunos: 120,
      taxaAprovacao: 91,
      mediaAvaliacao: 4.9,
      totalAvaliacoes: 22,
      especialidades: ['Mulheres', 'Ansiedade', 'Automático', 'Iniciantes'],
      transmissoes: ['Automático'],
    },
    {
      nome: 'Roberto Alves',
      email: 'roberto@dirigeja.com.br',
      genero: 'M',
      cidade: 'Jacareí',
      estado: 'SP',
      lat: -23.2994,
      lng: -45.9647,
      bio: 'Veterano com 12 anos. Aprovação garantida ou reembolso das últimas 2 aulas.',
      precoPorHora: 110,
      cnhEAR: 'EAR-003456',
      anosExperiencia: 12,
      totalAlunos: 500,
      taxaAprovacao: 97,
      mediaAvaliacao: 4.7,
      totalAvaliacoes: 58,
      especialidades: ['Estrada', 'Manual', 'Prova prática', 'Baliza'],
      transmissoes: ['Manual'],
    },
    {
      nome: 'Fernanda Rocha',
      email: 'fernanda@dirigeja.com.br',
      genero: 'F',
      cidade: 'Taubaté',
      estado: 'SP',
      lat: -23.0294,
      lng: -45.5547,
      bio: 'Instrutora jovem e dinâmica. Método moderno focado em confiança e autonomia.',
      precoPorHora: 95,
      cnhEAR: 'EAR-004567',
      anosExperiencia: 3,
      totalAlunos: 80,
      taxaAprovacao: 88,
      mediaAvaliacao: 4.8,
      totalAvaliacoes: 31,
      especialidades: ['CNH-B', 'Jovens', 'Prova prática', 'Iniciantes'],
      transmissoes: ['Manual', 'Automático'],
    },
  ]

  for (const inst of instrutores) {
    const senha = await bcrypt.hash('instrutor123', 12)
    const user = await prisma.user.upsert({
      where: { email: inst.email },
      update: {},
      create: {
        nome: inst.nome,
        email: inst.email,
        senha,
        role: 'INSTRUTOR',
        genero: inst.genero,
        kyc: {
          create: { status: 'APROVADO', analisadoEm: new Date() },
        },
        enderecos: {
          create: {
            cep: '12000-000',
            logradouro: 'Rua das Flores',
            numero: '100',
            bairro: 'Centro',
            cidade: inst.cidade,
            estado: inst.estado,
            lat: inst.lat,
            lng: inst.lng,
            principal: true,
          },
        },
      },
    })

    const perfil = await prisma.perfilInstrutor.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: inst.bio,
        cnhEAR: inst.cnhEAR,
        precoPorHora: inst.precoPorHora,
        anosExperiencia: inst.anosExperiencia,
        totalAlunos: inst.totalAlunos,
        taxaAprovacao: inst.taxaAprovacao,
        mediaAvaliacao: inst.mediaAvaliacao,
        totalAvaliacoes: inst.totalAvaliacoes,
        especialidades: inst.especialidades,
        transmissoes: inst.transmissoes,
        visivel: true,
        subscription: {
          create: {
            status: 'ATIVA',
            plano: 'mensal',
            valorMensal: 49,
            inicioEm: new Date(),
            fimEm: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    })

    console.log(`✅ Instrutor criado: ${inst.nome}`)
  }

  // Sample student
  const alunoSenha = await bcrypt.hash('aluno123', 12)
  await prisma.user.upsert({
    where: { email: 'joao@email.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'joao@email.com',
      senha: alunoSenha,
      role: 'ALUNO',
      genero: 'M',
      enderecos: {
        create: {
          cep: '12210-000',
          logradouro: 'Av. Principal',
          numero: '500',
          bairro: 'Jardim',
          cidade: 'São José dos Campos',
          estado: 'SP',
          lat: -23.2094,
          lng: -45.8747,
          principal: true,
        },
      },
    },
  })
  console.log('✅ Aluno de teste criado: joao@email.com')

  console.log('\n🎉 Seed concluído!')
  console.log('\n📋 Credenciais de teste:')
  console.log('Admin:    admin@dirigeja.com.br / admin123')
  console.log('Aluno:    joao@email.com / aluno123')
  console.log('Instrutor: carlos@dirigeja.com.br / instrutor123')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
