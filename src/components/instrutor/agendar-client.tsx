'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Car, ChevronLeft, Phone, ShieldCheck, AlertTriangle, CheckCircle,
  Loader2, Banknote, CreditCard,
} from 'lucide-react'
import { formatCurrency, gerarIniciais } from '@/lib/utils'
import { PaymentForm } from './payment-form'

const DIAS_SEMANA = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

function formatarData(dataStr: string, hora: string) {
  const [ano, mes, dia] = dataStr.split('-').map(Number)
  const d = new Date(ano, mes - 1, dia)
  return `${DIAS_SEMANA[d.getDay()]}, ${dia} de ${MESES[mes - 1]} de ${ano} às ${hora}`
}

interface Instrutor {
  nome: string
  avatarUrl: string | null
  genero: string | null
  precoPorHora: number
  modoRecebimento: 'PLATAFORMA' | 'DIRETO'
  veiculo: { marca: string; modelo: string; ano: number; cor: string; cambio: string } | null
}

interface Props {
  perfilId: string
  instrutor: Instrutor
  data: string
  hora: string
  duracao: number
  pixChave: string
}

type Step = 'confirmacao' | 'escolha_pagamento' | 'pagamento_plataforma' | 'sucesso'
type ModoPagamento = 'PLATAFORMA' | 'PRESENCIAL'

export function AgendarClient({ perfilId, instrutor, data, hora, duracao }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('confirmacao')
  const [modoPagamento, setModoPagamento] = useState<ModoPagamento>('PLATAFORMA')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<any>(null)

  const totalAula = instrutor.precoPorHora * duracao
  const iniciais = gerarIniciais(instrutor.nome)

  // Passo 1: confirma o agendamento com o modo de pagamento escolhido
  async function handleConfirmar(modo: ModoPagamento) {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch(`/api/agendar/${perfilId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, hora, duracao, modoPagamento: modo }),
      })
      const json = await res.json()
      if (!res.ok) { setErro(json.error || 'Erro ao agendar'); return }
      setResultado(json)
      setModoPagamento(modo)

      if (modo === 'PRESENCIAL') {
        setStep('sucesso')
      } else {
        setStep('pagamento_plataforma')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // ── SUCESSO ──────────────────────────────────────────────────
  if (step === 'sucesso') {
    const isPresencial = modoPagamento === 'PRESENCIAL'
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Aula agendada!</h1>
          <p className="text-gray-500 text-sm mb-6">
            {isPresencial
              ? 'Agendamento confirmado. O pagamento será feito diretamente ao instrutor na hora da aula.'
              : 'Pagamento confirmado! O instrutor foi notificado.'}
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Detalhes da aula</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Instrutor</span><span className="font-semibold text-gray-900">{instrutor.nome}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Data</span><span className="font-semibold text-gray-900">{formatarData(data, hora)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duração</span><span className="font-semibold text-gray-900">{duracao}h</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Valor</span><span className="font-semibold text-gray-900">{formatCurrency(totalAula)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Pagamento</span>
                <span className="font-semibold text-gray-900">{isPresencial ? 'Presencial' : 'Via plataforma'}</span>
              </div>
            </div>
          </div>

          {resultado?.telefoneInstrutor && (
            <div className={`rounded-2xl p-4 mb-5 ${isPresencial ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Phone className={`w-4 h-4 ${isPresencial ? 'text-amber-600' : 'text-green-600'}`} />
                <span className={`text-xs font-bold uppercase tracking-wide ${isPresencial ? 'text-amber-700' : 'text-green-700'}`}>
                  Contato do instrutor
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">{resultado.telefoneInstrutor}</p>
            </div>
          )}

          {isPresencial && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Lembre-se de combinar a forma de pagamento com o instrutor. Aceitam dinheiro, PIX ou cartão conforme combinado.
              </p>
            </div>
          )}

          <button
            onClick={() => router.push('/buscar')}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
          >
            Voltar para busca
          </button>
        </div>
      </div>
    )
  }

  // ── PAGAMENTO VIA PLATAFORMA (Stripe) ────────────────────────
  if (step === 'pagamento_plataforma') {
    return (
      <div className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => setStep('escolha_pagamento')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-extrabold text-gray-900 mb-5">Pagamento</h2>
          <PaymentForm
            aulaId={resultado?.aulaId}
            totalAula={totalAula}
            onSuccess={() => setStep('sucesso')}
          />
        </div>
      </div>
    )
  }

  // ── ESCOLHA DO MODO DE PAGAMENTO ─────────────────────────────
  if (step === 'escolha_pagamento') {
    return (
      <div className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => setStep('confirmacao')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Como você quer pagar?</h2>
          <p className="text-sm text-gray-500 mb-6">Escolha a forma de pagamento mais conveniente para você.</p>

          <div className="space-y-3 mb-6">
            {/* Plataforma — sempre disponível */}
            <button
              onClick={() => handleConfirmar('PLATAFORMA')}
              disabled={loading}
              className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-green-200 bg-green-50 hover:border-green-400 hover:bg-green-100 transition-all text-left disabled:opacity-60"
            >
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-sm">Pagar agora via plataforma</p>
                <p className="text-xs text-gray-500 mt-0.5">Cartão de crédito ou PIX. Pagamento seguro. O contato do instrutor é liberado na hora.</p>
                <p className="text-xs font-semibold text-green-700 mt-1">{formatCurrency(totalAula)}</p>
              </div>
            </button>

            {/* Presencial — só se o instrutor aceitar */}
            {instrutor.modoRecebimento === 'DIRETO' && (
              <button
                onClick={() => handleConfirmar('PRESENCIAL')}
                disabled={loading}
                className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all text-left disabled:opacity-60"
              >
                <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                  <Banknote className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 text-sm">Pagar na hora da aula</p>
                  <p className="text-xs text-gray-500 mt-0.5">Combine com o instrutor (dinheiro, PIX ou cartão). O agendamento é confirmado, mas o pagamento é feito presencialmente.</p>
                  <p className="text-xs font-semibold text-gray-600 mt-1">{formatCurrency(totalAula)} — a combinar</p>
                </div>
              </button>
            )}
          </div>

          {loading && (
            <div className="flex justify-center py-2">
              <Loader2 className="w-5 h-5 animate-spin text-green-600" />
            </div>
          )}

          {erro && <p className="text-sm text-red-600 text-center">{erro}</p>}
        </div>
      </div>
    )
  }

  // ── CONFIRMAÇÃO (resumo do agendamento) ──────────────────────
  return (
    <div className="max-w-lg mx-auto px-6 py-8">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ChevronLeft className="w-4 h-4" /> Voltar
      </button>

      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
        <h1 className="text-xl font-extrabold text-gray-900 mb-5">Confirmar agendamento</h1>

        {/* Instructor summary */}
        <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4 mb-5">
          <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-lg shrink-0 overflow-hidden">
            {instrutor.avatarUrl
              ? <img src={instrutor.avatarUrl} alt="" className="w-full h-full object-cover" />
              : iniciais}
          </div>
          <div>
            <p className="font-bold text-gray-900">{instrutor.nome}</p>
            {instrutor.veiculo && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                <Car className="w-3.5 h-3.5" />
                {instrutor.veiculo.marca} {instrutor.veiculo.modelo} {instrutor.veiculo.ano} · {instrutor.veiculo.cor} · Câmbio {instrutor.veiculo.cambio}
              </div>
            )}
          </div>
        </div>

        {/* Booking details */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Data e horário</span>
            <span className="font-semibold text-gray-900 text-right">{formatarData(data, hora)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Duração</span>
            <span className="font-semibold text-gray-900">{duracao} hora{duracao > 1 ? 's' : ''}</span>
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>{duracao}h × {formatCurrency(instrutor.precoPorHora)}</span>
              <span>{formatCurrency(totalAula)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
              <span>Total</span>
              <span>{formatCurrency(totalAula)}</span>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-green-600" />
            <p className="text-sm font-bold text-green-800">Agendamento seguro</p>
          </div>
          <p className="text-xs text-green-700 leading-relaxed">
            No próximo passo você escolhe como pagar — agora via plataforma (cartão ou PIX) ou na hora da aula.
          </p>
        </div>

        {erro && <p className="text-sm text-red-600 text-center mb-3">{erro}</p>}

        <button
          onClick={() => setStep('escolha_pagamento')}
          className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
