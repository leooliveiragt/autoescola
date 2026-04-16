'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { UserPlus, Search, CalendarCheck, ShieldCheck, Star, CreditCard } from 'lucide-react'

const STEPS_ALUNO = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Crie sua conta grátis',
    desc: 'Cadastro em menos de 2 minutos. Verificação de identidade simples e segura.',
  },
  {
    num: '02',
    icon: Search,
    title: 'Encontre seu instrutor',
    desc: 'Busque por localização, preço ou avaliação. Veja perfis completos com depoimentos reais.',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Agende e dirija',
    desc: 'Escolha data e horário disponível. Pague com segurança e receba confirmação na hora.',
  },
]

const DIFERENCIAIS = [
  {
    icon: ShieldCheck,
    title: 'Instrutores verificados',
    desc: 'Todos os instrutores passam por verificação de identidade (KYC) antes de aparecer na plataforma.',
  },
  {
    icon: Star,
    title: 'Avaliações reais',
    desc: 'Após cada aula o aluno pode avaliar o instrutor. Notas e comentários visíveis para todos.',
  },
  {
    icon: CreditCard,
    title: 'Pagamento seguro',
    desc: 'Pagamento processado com segurança. O instrutor só recebe após a aula ser confirmada.',
  },
]

export default function ComoFuncionaPage() {
  const { data: session } = useSession()
  const role = session?.user?.role

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Como funciona</span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-3 text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Simples, rápido e seguro
          </h1>
          <p className="text-gray-500 mt-4 text-base max-w-xl mx-auto leading-relaxed">
            A DirigêJá conecta alunos a instrutores de direção verificados. Agende aulas práticas com quem você escolheu, no horário que preferir.
          </p>
        </div>
      </section>

      {/* Passos */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Para alunos
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {STEPS_ALUNO.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.num} className="bg-white rounded-2xl border-2 border-gray-100 p-6 flex flex-col items-start">
                  <div className="relative w-16 h-16 flex items-center justify-center mb-5 shrink-0">
                    <div className="absolute inset-0 rotate-45 rounded-xl bg-amber-400 shadow-md shadow-amber-200" />
                    <div className="relative z-10 flex flex-col items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
                      <span className="text-[10px] font-black text-gray-900 leading-none mt-0.5">{s.num}</span>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-10 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Por que usar a DirigêJá?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {DIFERENCIAIS.map((d) => {
              const Icon = d.icon
              return (
                <div key={d.title} className="bg-white rounded-2xl border border-gray-100 p-6">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-green-700" />
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1.5">{d.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{d.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-xl mx-auto px-6 text-center">
          {role === 'INSTRUTOR' ? (
            <>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Seu painel de instrutor
              </h2>
              <p className="text-gray-500 text-sm mb-8">Gerencie seus agendamentos, disponibilidade e perfil público.</p>
              <Link
                href="/instrutor/dashboard"
                className="inline-block px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Ir para meu painel
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Pronto para começar?
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                {session ? 'Encontre seu instrutor e agende sua primeira aula.' : 'Cadastre-se grátis e agende sua primeira aula hoje.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {!session && (
                  <Link
                    href="/register"
                    className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
                  >
                    Criar conta grátis
                  </Link>
                )}
                <Link
                  href="/buscar"
                  className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  Buscar instrutores
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  )
}
