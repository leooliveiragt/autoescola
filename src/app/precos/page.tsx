'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Check, BadgeCheck } from 'lucide-react'

const PLANO_INSTRUTOR_ITENS = [
  'Perfil completo com foto e bio',
  'Agenda de disponibilidade',
  'Receba agendamentos de alunos',
  'Painel de controle de aulas',
  'Avaliações e reputação',
  'Suporte via WhatsApp',
  '90% de repasse por aula',
]

const PLANO_ALUNO_ITENS = [
  'Cadastro gratuito',
  'Busca por localização e CEP',
  'Filtros por preço e avaliação',
  'Agendamento online',
  'Histórico de aulas',
  'Pagamento seguro',
]

const STATUS_LABEL: Record<string, string> = {
  ATIVA: 'Ativa',
  TRIAL: 'Trial',
  CANCELADA: 'Cancelada',
  EXPIRADA: 'Expirada',
}

export default function PrecosPage() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const isInstrutor = role === 'INSTRUTOR'
  const isAluno = role === 'ALUNO'

  const [sub, setSub] = useState<any>(null)

  useEffect(() => {
    if (isInstrutor) {
      fetch('/api/instrutor/assinatura')
        .then(r => r.json())
        .then(d => setSub(d.subscription))
    }
  }, [isInstrutor])

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gray-50 py-16 border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Preços</span>
          <h1 className="text-4xl font-extrabold tracking-tight mt-3 text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Transparente e sem surpresas
          </h1>
          <p className="text-gray-500 mt-4 text-base max-w-lg mx-auto">
            Para alunos é sempre grátis. Para instrutores, uma mensalidade acessível para manter o perfil ativo.
          </p>
        </div>
      </section>

      {/* Planos */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-6">

            {/* Plano Aluno */}
            <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 flex flex-col">
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Para alunos</span>
                <h2 className="text-2xl font-extrabold text-gray-900 mt-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Grátis</h2>
                <p className="text-gray-500 text-sm mt-1">Para sempre. Sem cartão de crédito.</p>
              </div>
              <ul className="space-y-3 flex-1">
                {PLANO_ALUNO_ITENS.map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              {isAluno ? (
                <Link
                  href="/buscar"
                  className="block w-full py-3.5 text-center bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors text-sm mt-8"
                >
                  Buscar instrutores
                </Link>
              ) : !session ? (
                <Link
                  href="/register"
                  className="block w-full py-3.5 text-center bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-700 transition-colors text-sm mt-8"
                >
                  Criar conta grátis
                </Link>
              ) : null}
            </div>

            {/* Plano Instrutor */}
            <div className="bg-green-600 rounded-3xl p-8 text-white relative overflow-hidden flex flex-col">
              <div className="absolute top-4 right-4 text-xs font-bold bg-amber-400 text-gray-900 px-3 py-1 rounded-full">
                Mais popular
              </div>
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-widest text-green-200">Para instrutores</span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>R$14,90</span>
                  <span className="text-green-200 text-sm">/mês</span>
                </div>
                <p className="text-green-200 text-sm mt-1">Após aprovação do cadastro.</p>
              </div>

              {/* Badge de plano ativo para instrutores logados */}
              {isInstrutor && sub && (
                <div className="mb-4 flex items-center gap-2 bg-green-500 border border-green-400 rounded-xl px-3 py-2.5">
                  <BadgeCheck className="w-4 h-4 text-white shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Seu plano atual</p>
                    <p className="text-xs text-green-200">
                      Status: <strong className="text-white">{STATUS_LABEL[sub.status] ?? sub.status}</strong>
                      {sub.cartaoFinal && ` · Cartão final ${sub.cartaoFinal}`}
                    </p>
                  </div>
                </div>
              )}

              <ul className="space-y-3 flex-1">
                {PLANO_INSTRUTOR_ITENS.map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>

              {isInstrutor ? (
                <Link
                  href="/instrutor/assinatura"
                  className="block w-full py-3.5 text-center bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors text-sm mt-8"
                >
                  Ver minha assinatura
                </Link>
              ) : (
                <Link
                  href="/register?role=instrutor"
                  className="block w-full py-3.5 text-center bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-colors text-sm mt-8"
                >
                  Criar meu perfil
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Dúvidas frequentes
          </h2>
          <div className="space-y-4">
            {[
              { q: 'Quanto o instrutor recebe por aula?', a: '90% do valor cobrado ao aluno. A plataforma retém 10% para cobrir os custos operacionais.' },
              { q: 'O aluno paga alguma taxa extra?', a: 'Não. O aluno paga exatamente o valor definido pelo instrutor, sem acréscimos.' },
              { q: 'Como funciona a mensalidade do instrutor?', a: 'Após a aprovação do cadastro, o instrutor paga R$14,90/mês para manter o perfil ativo e visível para alunos.' },
              { q: 'Posso pagar a mensalidade via PIX?', a: 'Sim. Aceitamos PIX e cartão de crédito. O pagamento é confirmado manualmente pela nossa equipe.' },
            ].map(item => (
              <div key={item.q} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.q}</h3>
                <p className="text-sm text-gray-500">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
