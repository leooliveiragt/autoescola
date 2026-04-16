'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, MessageCircle } from 'lucide-react'
import { SteeringWheel, TrafficCone, Tyre } from './driving-icons'

export function InstructorCTA() {
  const { data: session } = useSession()
  const router = useRouter()
  const role = session?.user?.role
  const [showModal, setShowModal] = useState(false)

  const ctaLabel = role === 'INSTRUTOR' ? 'Ir para meu painel' : 'Criar meu perfil de instrutor'

  function handleCTA(e: React.MouseEvent) {
    if (role === 'ALUNO') {
      e.preventDefault()
      setShowModal(true)
      return
    }
    if (role === 'INSTRUTOR') {
      e.preventDefault()
      router.push('/instrutor/dashboard')
    }
  }

  return (
    <>
      {/* Modal aluno tentando virar instrutor */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-7 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7 text-amber-500" />
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Você já tem uma conta de aluno
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Sua conta está cadastrada como <strong className="text-gray-800">aluno</strong>. Caso tenha se cadastrado por engano e queira atuar como instrutor, entre em contato com nosso suporte para solicitar a troca de perfil.
            </p>
            <div className="space-y-2">
              <Link
                href="/suporte/troca-perfil"
                onClick={() => setShowModal(false)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Solicitar troca de perfil
              </Link>
              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="relative py-20 bg-white overflow-hidden">
        {/* Amber road stripe top */}
        <div className="absolute top-0 left-0 right-0 flex gap-3 h-2">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-100'}`} />
          ))}
        </div>
        {/* Amber road stripe bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex gap-3 h-2">
          {[...Array(30)].map((_, i) => (
            <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-100'}`} />
          ))}
        </div>

        {/* Traffic cones — corners */}
        <div className="absolute bottom-4 left-6 hidden lg:block opacity-30">
          <TrafficCone className="w-10 h-14" />
        </div>
        <div className="absolute bottom-4 left-20 hidden lg:block opacity-15">
          <TrafficCone className="w-7 h-10" />
        </div>
        <div className="absolute bottom-4 right-6 hidden lg:block opacity-30">
          <TrafficCone className="w-10 h-14" />
        </div>
        <div className="absolute bottom-4 right-20 hidden lg:block opacity-15">
          <TrafficCone className="w-7 h-10" />
        </div>

        {/* Tyres — far corners */}
        <div className="absolute top-8 left-8 hidden xl:block opacity-8">
          <Tyre
            className="w-20 h-20 text-gray-300 animate-spin"
            style={{ animationDuration: '7s' }}
          />
        </div>
        <div className="absolute top-8 right-8 hidden xl:block opacity-8">
          <Tyre
            className="w-20 h-20 text-gray-300 animate-spin"
            style={{ animationDuration: '7s', animationDirection: 'reverse' }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          {/* Steering wheel badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 relative">
            <div className="absolute inset-0 rotate-45 rounded-2xl bg-amber-400" />
            <SteeringWheel className="relative z-10 w-8 h-8 text-gray-900" />
          </div>

          <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Você é instrutor de direção?
          </h2>
          <p className="text-gray-500 text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Crie seu perfil, defina seu preço e alcance alunos na sua região. A nova lei facilita seu trabalho como autônomo.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={role === 'INSTRUTOR' ? '/instrutor/dashboard' : '/register?role=instrutor'}
              onClick={handleCTA}
              className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm shadow-sm"
            >
              {ctaLabel}
            </Link>
            {role !== 'INSTRUTOR' && (
              <Link
                href="/para-instrutores"
                className="px-8 py-3.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Saber mais
              </Link>
            )}
          </div>

          <div className="flex justify-center gap-8 mt-10 pt-8 border-t border-gray-100">
            {[
              { val: 'R$0', label: 'Para criar o perfil' },
              { val: '90%', label: 'Você fica de cada aula' },
              { val: 'R$14,90/mês', label: 'Plano mensal' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-2xl font-extrabold text-amber-500">{s.val}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
