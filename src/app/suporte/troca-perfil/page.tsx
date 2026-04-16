'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { MessageCircle, ArrowLeft, AlertTriangle } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

// Substitua pelo número do WhatsApp de suporte (com código do país, sem espaços/símbolos)
const WHATSAPP_NUMBER = '5511999999999'

const WHATSAPP_MSG = encodeURIComponent(
  'Olá! Criei minha conta no DirigêJá como aluno, mas gostaria de me cadastrar como instrutor. Podem realizar a troca do meu perfil?'
)

export default function TrocaPerfilPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-16">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para a página inicial
        </Link>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">

          <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>

          <h1
            className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight"
            style={{ fontFamily: 'Plus Jakarta Sans' }}
          >
            Trocar perfil para instrutor
          </h1>

          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Sua conta está cadastrada como <strong className="text-gray-800">aluno</strong>.
            Para atuar como instrutor na plataforma é necessário solicitar a troca de perfil
            à nossa equipe de suporte.
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">O que acontece ao solicitar?</p>
            {[
              'Nossa equipe analisa seu pedido em até 1 dia útil.',
              'Seu histórico de aluno é preservado durante a migração.',
              'Após a troca você passa pelo processo de verificação de instrutor (KYC).',
            ].map(item => (
              <div key={item} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                {item}
              </div>
            ))}
          </div>

          {session ? (
            <div className="space-y-3">
              <p className="text-xs text-gray-400 mb-1">
                Solicitar para: <strong className="text-gray-700">{session.user.email}</strong>
              </p>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-[#25D366] text-white font-bold rounded-2xl hover:bg-[#1ebe5d] transition-colors text-sm shadow-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Falar com suporte pelo WhatsApp
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500 mb-2">Faça login antes de solicitar a troca.</p>
              <Link
                href="/login?redirect=/suporte/troca-perfil"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Entrar na minha conta
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MSG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-[#25D366] text-white font-bold rounded-xl hover:bg-[#1ebe5d] transition-colors text-sm"
              >
                <MessageCircle className="w-5 h-5" />
                Falar pelo WhatsApp mesmo assim
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
