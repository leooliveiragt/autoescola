'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { UserPlus, ShieldCheck, CalendarCheck, TrendingUp, Clock, Star } from 'lucide-react'

const BENEFICIOS = [
  { icon: TrendingUp, title: 'Você define o seu preço', desc: 'Estabeleça o valor por hora da sua aula. Você tem controle total sobre a sua renda.' },
  { icon: Clock, title: 'Agenda flexível', desc: 'Cadastre sua disponibilidade e aceite agendamentos quando quiser. Sem horário fixo.' },
  { icon: ShieldCheck, title: 'Plataforma segura', desc: 'Seus dados e pagamentos protegidos. Alunos verificados antes de agendar.' },
  { icon: Star, title: 'Construa sua reputação', desc: 'Avaliações reais de alunos aumentam sua visibilidade e atraem mais clientes.' },
  { icon: CalendarCheck, title: 'Gestão simples', desc: 'Veja todos seus agendamentos em um só lugar. Histórico de aulas e pagamentos.' },
  { icon: UserPlus, title: 'Alcance novos alunos', desc: 'Apareça para alunos da sua região que buscam instrutores qualificados.' },
]

const STEPS = [
  { num: '01', title: 'Crie seu perfil', desc: 'Cadastro grátis com foto, bio, preço por hora e área de atendimento.' },
  { num: '02', title: 'Envie seus documentos', desc: 'Verificação de identidade (KYC) rápida para garantir a segurança da plataforma.' },
  { num: '03', title: 'Ative sua conta', desc: 'Após aprovação, seu perfil fica visível para alunos da sua região.' },
  { num: '04', title: 'Receba agendamentos', desc: 'Alunos escolhem você, agendam e pagam direto pela plataforma.' },
]

export default function ParaInstrutoresPage() {
  const { data: session } = useSession()
  const isInstrutor = session?.user?.role === 'INSTRUTOR'

  const heroCta = isInstrutor
    ? { href: '/instrutor/dashboard', label: 'Ir para meu painel' }
    : { href: '/register?role=instrutor', label: 'Criar meu perfil grátis' }

  const finalCta = isInstrutor
    ? { href: '/instrutor/dashboard', label: 'Ir para meu painel' }
    : { href: '/register?role=instrutor', label: 'Criar meu perfil de instrutor' }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-900 text-white py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Para instrutores</span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {isInstrutor ? 'Bem-vindo de volta, instrutor' : 'Cresça como instrutor autônomo'}
          </h1>
          <p className="text-gray-400 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            {isInstrutor
              ? 'Gerencie seu perfil, disponibilidade e acompanhe seus agendamentos pelo painel.'
              : 'A DirigêJá conecta você a alunos na sua região. Defina seu preço, sua agenda e comece a receber hoje.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link
              href={heroCta.href}
              className="px-8 py-3.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-400 transition-colors text-sm"
            >
              {heroCta.label}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-10 mt-12 pt-10 border-t border-gray-700">
            {[
              { val: 'R$0', label: 'Para criar o perfil' },
              { val: '90%', label: 'Repasse por aula' },
              { val: 'R$14,90/mês', label: 'Plano mensal' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-amber-400">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Por que ser parceiro DirigêJá?
          </h2>
          <div className="grid md:grid-cols-3 gap-5">
            {BENEFICIOS.map((b) => {
              const Icon = b.icon
              return (
                <div key={b.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Como funciona — só mostra para não-instrutores */}
      {!isInstrutor && (
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Como começar
            </h2>
            <div className="space-y-4">
              {STEPS.map((s) => (
                <div key={s.num} className="flex items-start gap-5 bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="relative w-12 h-12 shrink-0 flex items-center justify-center">
                    <div className="absolute inset-0 rotate-45 rounded-xl bg-amber-400" />
                    <span className="relative z-10 text-sm font-black text-gray-900">{s.num}</span>
                  </div>
                  <div className="pt-1">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">{s.title}</h3>
                    <p className="text-sm text-gray-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="py-16 bg-green-600">
        <div className="max-w-xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            {isInstrutor ? 'Acesse seu painel agora' : 'Comece agora, é grátis'}
          </h2>
          <p className="text-green-100 text-sm mb-8">
            {isInstrutor
              ? 'Veja seus agendamentos, configure sua disponibilidade e gerencie seu perfil.'
              : 'Crie seu perfil e comece a receber alunos na sua região.'}
          </p>
          <Link
            href={finalCta.href}
            className="inline-block px-8 py-3.5 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors text-sm"
          >
            {finalCta.label}
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
