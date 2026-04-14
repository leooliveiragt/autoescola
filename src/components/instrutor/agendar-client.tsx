'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, ChevronLeft, Phone, ShieldCheck, AlertTriangle, CheckCircle, Loader2, CreditCard } from 'lucide-react'
import { formatCurrency, gerarIniciais } from '@/lib/utils'

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
}

type Step = 'confirmacao' | 'pagamento' | 'sucesso'

export function AgendarClient({ perfilId, instrutor, data, hora, duracao }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('confirmacao')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [resultado, setResultado] = useState<any>(null)

  // Payment form (PLATAFORMA only)
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')
  const [cardName, setCardName] = useState('')

  const totalAula = instrutor.precoPorHora * duracao

  const iniciais = gerarIniciais(instrutor.nome)

  async function handleConfirmar() {
    setLoading(true)
    setErro('')
    try {
      const res = await fetch(`/api/agendar/${perfilId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, hora, duracao }),
      })
      const json = await res.json()
      if (!res.ok) { setErro(json.error || 'Erro ao agendar'); return }
      setResultado(json)
      if (instrutor.modoRecebimento === 'DIRETO') {
        setStep('sucesso')
      } else {
        setStep('pagamento')
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  async function handlePagar() {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      setErro('Preencha todos os campos do cartão.')
      return
    }
    setLoading(true)
    setErro('')
    // Simulate payment processing (Stripe integration would go here)
    await new Promise(r => setTimeout(r, 1500))
    setLoading(false)
    // resultado already has telefoneInstrutor from the booking step
    setStep('sucesso')
  }

  // ── SUCESSO ─────────────────────────────────────────────
  if (step === 'sucesso') {
    const isDireto = instrutor.modoRecebimento === 'DIRETO'
    return (
      <div className="max-w-lg mx-auto px-6 py-12">
        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Aula agendada!</h1>
          <p className="text-gray-500 text-sm mb-6">
            {isDireto
              ? 'Seu agendamento foi confirmado. Entre em contato com o instrutor para acertar os detalhes e o pagamento.'
              : 'Pagamento confirmado! O instrutor foi notificado e seu contato está disponível abaixo.'}
          </p>

          <div className="bg-gray-50 rounded-2xl p-4 text-left mb-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Detalhes da aula</p>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Instrutor</span><span className="font-semibold text-gray-900">{instrutor.nome}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Data</span><span className="font-semibold text-gray-900">{formatarData(data, hora)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duração</span><span className="font-semibold text-gray-900">{duracao}h</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Valor</span><span className="font-semibold text-gray-900">{formatCurrency(totalAula)}</span></div>
            </div>
          </div>

          {/* Phone reveal */}
          {resultado?.telefoneInstrutor ? (
            <div className={`rounded-2xl p-4 mb-5 ${isDireto ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Phone className={`w-4 h-4 ${isDireto ? 'text-amber-600' : 'text-green-600'}`} />
                <span className={`text-xs font-bold uppercase tracking-wide ${isDireto ? 'text-amber-700' : 'text-green-700'}`}>
                  Contato do instrutor
                </span>
              </div>
              <p className="text-xl font-bold text-gray-900">{resultado.telefoneInstrutor}</p>
              {isDireto && (
                <p className="text-xs text-amber-600 mt-2 leading-relaxed">
                  Este instrutor prefere negociar o pagamento diretamente. Combine os detalhes com ele pelo WhatsApp ou telefone.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Phone className="w-4 h-4 text-green-600" />
                <span className="text-xs font-bold uppercase tracking-wide text-green-700">Contato do instrutor</span>
              </div>
              <p className="text-sm text-gray-500">O instrutor entrará em contato para confirmar os detalhes da aula.</p>
            </div>
          )}

          {isDireto && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-5 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-400 leading-relaxed">
                Pagamentos negociados diretamente entre instrutor e aluno são de responsabilidade exclusiva de cada um. A DirigêJá não intermedia nem se responsabiliza por essa transação.
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

  // ── PAGAMENTO (PLATAFORMA only) ──────────────────────────
  if (step === 'pagamento') {
    return (
      <div className="max-w-lg mx-auto px-6 py-8">
        <button onClick={() => setStep('confirmacao')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6">
          <ChevronLeft className="w-4 h-4" /> Voltar
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-extrabold text-gray-900">Dados de pagamento</h2>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">{duracao}h × {formatCurrency(instrutor.precoPorHora)}</span><span className="font-medium">{formatCurrency(totalAula)}</span></div>
            <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200"><span>Total</span><span>{formatCurrency(totalAula)}</span></div>
          </div>

          <div className="space-y-3 mb-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Número do cartão</label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Validade</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4)
                    setCardExpiry(v.length > 2 ? `${v.slice(0,2)}/${v.slice(2)}` : v)
                  }}
                  placeholder="MM/AA"
                  maxLength={5}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">CVV</label>
                <input
                  type="text"
                  value={cardCvv}
                  onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="000"
                  maxLength={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Nome no cartão</label>
              <input
                type="text"
                value={cardName}
                onChange={e => setCardName(e.target.value.toUpperCase())}
                placeholder="COMO ESCRITO NO CARTÃO"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono"
              />
            </div>
          </div>

          {erro && <p className="text-sm text-red-600 text-center mb-3">{erro}</p>}

          <button
            onClick={handlePagar}
            disabled={loading}
            className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {loading ? 'Processando...' : `Pagar ${formatCurrency(totalAula)}`}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">🔒 Pagamento seguro via Stripe. Seus dados são criptografados.</p>
        </div>
      </div>
    )
  }

  // ── CONFIRMAÇÃO (step inicial) ───────────────────────────
  const isDireto = instrutor.modoRecebimento === 'DIRETO'
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
        <div className="space-y-3 mb-5">
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

        {/* Payment mode info */}
        {isDireto ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">🤝</span>
              <p className="text-sm font-bold text-amber-800">Pagamento direto com o instrutor</p>
            </div>
            <p className="text-xs text-amber-700 leading-relaxed">
              Este instrutor prefere negociar o pagamento diretamente com o aluno. Após confirmar, você receberá o contato dele para combinar os detalhes e a forma de pagamento.
            </p>
            <p className="text-xs text-amber-600 mt-2 font-medium">
              ⚠️ Pagamentos fora da plataforma são de responsabilidade exclusiva das partes envolvidas.
            </p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-5">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <p className="text-sm font-bold text-green-800">Pagamento via plataforma</p>
            </div>
            <p className="text-xs text-green-700 leading-relaxed">
              Após confirmar você será levado para a tela de pagamento. O contato do instrutor será liberado após a confirmação do pagamento.
            </p>
          </div>
        )}

        {erro && <p className="text-sm text-red-600 text-center mb-3">{erro}</p>}

        <button
          onClick={handleConfirmar}
          disabled={loading}
          className={`w-full py-3.5 font-bold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60 ${
            isDireto
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {loading ? 'Confirmando...' : isDireto ? 'Confirmar agendamento' : 'Confirmar e ir para pagamento'}
        </button>
      </div>
    </div>
  )
}
