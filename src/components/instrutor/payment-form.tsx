'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { CreditCard, Copy, Check, Loader2, ShieldCheck, RefreshCw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ── Formulário de cartão ─────────────────────────────────────
function CardForm({
  clientSecret,
  demo,
  onSuccess,
}: {
  clientSecret: string | null
  demo: boolean
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSubmit() {
    // Modo demo: simula pagamento sem chamar o Stripe
    if (demo || !clientSecret) {
      setLoading(true)
      await new Promise(r => setTimeout(r, 1000))
      setLoading(false)
      onSuccess()
      return
    }

    if (!stripe || !elements) return
    const card = elements.getElement(CardElement)
    if (!card) return

    setLoading(true)
    setErro('')
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card },
    })
    setLoading(false)

    if (error) { setErro(error.message ?? 'Erro ao processar pagamento.'); return }
    if (paymentIntent?.status === 'succeeded') onSuccess()
  }

  return (
    <div className="space-y-4">
      {demo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
          Modo demonstração — pagamento simulado, Stripe não conectado ainda.
        </div>
      )}
      <div className="px-4 py-3 border-2 border-gray-200 rounded-xl focus-within:border-green-500 transition-colors">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '14px',
                color: '#111827',
                fontFamily: 'ui-sans-serif, system-ui, sans-serif',
                '::placeholder': { color: '#9ca3af' },
              },
              invalid: { color: '#dc2626' },
            },
            disabled: demo,
          }}
        />
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2">{erro}</p>}

      <button
        onClick={handleSubmit}
        disabled={loading || (!demo && !stripe)}
        className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
          : <><ShieldCheck className="w-4 h-4" /> {demo ? 'Simular pagamento' : 'Pagar'}</>}
      </button>
      {!demo && <p className="text-center text-xs text-gray-400">🔒 Pagamento seguro via Stripe. Dados criptografados.</p>}
    </div>
  )
}

// ── Exibição do QR Code PIX ──────────────────────────────────
function PixDisplay({
  clientSecret,
  demo,
  pixQrCodeUrl,
  pixCopiaECola,
  expiracao,
  onSuccess,
}: {
  clientSecret: string | null
  demo: boolean
  pixQrCodeUrl: string | null
  pixCopiaECola: string | null
  expiracao: number | null
  onSuccess: () => void
}) {
  const stripe = useStripe()
  const [copiado, setCopiado] = useState(false)
  const [verificando, setVerificando] = useState(false)

  const verificarPagamento = useCallback(async () => {
    if (demo || !stripe || !clientSecret) return
    setVerificando(true)
    const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret)
    setVerificando(false)
    if (paymentIntent?.status === 'succeeded') onSuccess()
  }, [stripe, clientSecret, demo, onSuccess])

  // Polling automático a cada 5s (apenas com Stripe conectado)
  useEffect(() => {
    if (demo) return
    const interval = setInterval(verificarPagamento, 5000)
    return () => clearInterval(interval)
  }, [verificarPagamento, demo])

  function copiar() {
    if (!pixCopiaECola) return
    navigator.clipboard.writeText(pixCopiaECola)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const expiracaoFormatada = expiracao
    ? new Date(expiracao * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : null

  return (
    <div className="space-y-4">
      {demo && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
          Modo demonstração — QR Code real será gerado pelo Stripe quando conectado.
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm text-green-800 space-y-1.5">
        <p className="font-bold">Como pagar via PIX:</p>
        <ol className="text-xs text-green-700 space-y-1 list-decimal list-inside">
          <li>Abra o app do seu banco</li>
          <li>Escaneie o QR Code ou copie o código</li>
          <li>Confirme o pagamento — a aula será liberada automaticamente</li>
        </ol>
        {expiracaoFormatada && (
          <p className="text-xs text-green-600 font-medium pt-1">⏱ Expira às {expiracaoFormatada}</p>
        )}
      </div>

      {/* QR Code */}
      {pixQrCodeUrl ? (
        <div className="flex justify-center">
          <img src={pixQrCodeUrl} alt="QR Code PIX" className="w-48 h-48 rounded-2xl border border-gray-200" />
        </div>
      ) : (
        <div className="flex justify-center items-center w-48 h-48 mx-auto rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-xs text-center px-4">
          QR Code aparecerá aqui após conectar o Stripe
        </div>
      )}

      {/* Copia e Cola */}
      {pixCopiaECola && (
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
            Pix Copia e Cola
          </label>
          <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5">
            <span className="flex-1 text-xs font-mono text-gray-700 truncate">{pixCopiaECola}</span>
            <button
              onClick={copiar}
              className="shrink-0 flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
            >
              {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiado ? 'Copiado!' : 'Copiar'}
            </button>
          </div>
        </div>
      )}

      {/* Verificar / simular */}
      <button
        onClick={demo ? onSuccess : verificarPagamento}
        disabled={verificando}
        className="w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        <RefreshCw className={`w-4 h-4 ${verificando ? 'animate-spin' : ''}`} />
        {demo ? 'Simular PIX pago' : verificando ? 'Verificando...' : 'Já paguei — verificar'}
      </button>
      {!demo && <p className="text-center text-xs text-gray-400">A confirmação é automática. Aguarde alguns segundos após o pagamento.</p>}
    </div>
  )
}

// ── Componente interno (dentro do provider Elements) ─────────
function PaymentFormInner({
  aulaId,
  totalAula,
  onSuccess,
}: {
  aulaId: string
  totalAula: number
  onSuccess: () => void
}) {
  const [aba, setAba] = useState<'cartao' | 'pix'>('cartao')
  const [loadingIntent, setLoadingIntent] = useState(false)
  const [intentData, setIntentData] = useState<{
    demo?: boolean
    clientSecret: string | null
    pixQrCodeUrl?: string | null
    pixCopiaECola?: string | null
    expiracao?: number | null
  } | null>(null)
  const [erro, setErro] = useState('')

  async function carregarIntent(metodo: 'cartao' | 'pix') {
    setLoadingIntent(true)
    setErro('')
    setIntentData(null)
    try {
      const res = await fetch('/api/pagamento/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aulaId, metodo }),
      })
      const data = await res.json()
      if (!res.ok) { setErro(data.error ?? 'Erro ao iniciar pagamento'); return }
      setIntentData(data)
    } catch {
      setErro('Erro de conexão. Tente novamente.')
    } finally {
      setLoadingIntent(false)
    }
  }

  useEffect(() => {
    carregarIntent(aba)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba])

  return (
    <div>
      {/* Abas */}
      <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-xl">
        <button
          onClick={() => setAba('cartao')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${aba === 'cartao' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <CreditCard className="w-4 h-4" /> Cartão
        </button>
        <button
          onClick={() => setAba('pix')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-colors ${aba === 'pix' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <span className="text-base leading-none">🏦</span> PIX
        </button>
      </div>

      {/* Resumo */}
      <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-sm flex justify-between font-bold text-gray-900">
        <span>Total</span>
        <span>{formatCurrency(totalAula)}</span>
      </div>

      {erro && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-4">{erro}</p>}

      {loadingIntent ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-green-600" />
        </div>
      ) : intentData ? (
        aba === 'cartao' ? (
          <CardForm
            clientSecret={intentData.clientSecret}
            demo={intentData.demo ?? false}
            onSuccess={onSuccess}
          />
        ) : (
          <PixDisplay
            clientSecret={intentData.clientSecret}
            demo={intentData.demo ?? false}
            pixQrCodeUrl={intentData.pixQrCodeUrl ?? null}
            pixCopiaECola={intentData.pixCopiaECola ?? null}
            expiracao={intentData.expiracao ?? null}
            onSuccess={onSuccess}
          />
        )
      ) : null}
    </div>
  )
}

// ── Componente público ───────────────────────────────────────
export function PaymentForm({
  aulaId,
  totalAula,
  onSuccess,
}: {
  aulaId: string
  totalAula: number
  onSuccess: () => void
}) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormInner aulaId={aulaId} totalAula={totalAula} onSuccess={onSuccess} />
    </Elements>
  )
}
