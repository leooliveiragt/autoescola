'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Lock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'

export default function PagamentoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()

  const instrutorNome = searchParams.get('nome') || 'Instrutor'
  const instrutorIniciais = searchParams.get('iniciais') || 'IN'
  const data = searchParams.get('data') || ''
  const hora = searchParams.get('hora') || ''
  const duracao = Number(searchParams.get('duracao') || 1)
  const preco = Number(searchParams.get('preco') || 0)

  const subtotal = preco * duracao
  const taxa = subtotal * 0.1
  const total = subtotal + taxa

  const [cardNumber, setCardNumber] = useState('')
  const [expiry, setExpiry] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardName, setCardName] = useState('')
  const [loading, setLoading] = useState(false)

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim().slice(0, 19)
  }

  function formatExpiry(val: string) {
    return val.replace(/\D/g, '').replace(/^(\d{2})/, '$1/').slice(0, 5)
  }

  async function handlePay() {
    setLoading(true)
    // In production: create PaymentIntent and confirm with Stripe.js
    await new Promise(r => setTimeout(r, 1500))
    router.push(`/avaliar?nome=${encodeURIComponent(instrutorNome)}&iniciais=${instrutorIniciais}`)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-3">
        <Link href="/" className="text-base font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Dirige<span className="text-green-600">Já</span>
        </Link>
        <div className="flex items-center gap-1 text-xs text-gray-400 ml-auto">
          <Lock className="w-3 h-3" />
          Pagamento seguro
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Voltar
        </button>

        <h1 className="text-xl font-extrabold mb-6 tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Confirmar reserva
        </h1>

        {/* Booking summary */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-800 flex items-center justify-center font-bold shrink-0">
            {instrutorIniciais}
          </div>
          <div className="flex-1">
            <div className="font-bold text-gray-900 text-sm">{instrutorNome}</div>
            <div className="text-xs text-gray-500 mt-0.5">
              {data} às {hora} · {duracao}h
            </div>
          </div>
        </div>

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{duracao}h × {formatCurrency(preco)}</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Taxa da plataforma (10%)</span>
              <span>{formatCurrency(taxa)}</span>
            </div>
          </div>
          <div className="flex justify-between text-base font-extrabold text-gray-900 pt-3 border-t border-gray-100">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Card form */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5">
          <h3 className="text-sm font-bold text-gray-900 mb-4">Dados do cartão</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Número do cartão</label>
              <input
                type="text"
                value={cardNumber}
                onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono tracking-wider"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Validade</label>
                <input
                  type="text"
                  value={expiry}
                  onChange={e => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">CVV</label>
                <input
                  type="text"
                  value={cvv}
                  onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="123"
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
                placeholder="JOÃO SILVA"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm uppercase tracking-wider"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 mb-5">
          <Lock className="w-3.5 h-3.5 shrink-0 text-green-600" />
          Seus dados de pagamento são criptografados e processados com segurança via Stripe. O DirigêJá não armazena dados do cartão.
        </div>

        <button
          onClick={handlePay}
          disabled={loading || !cardNumber || !expiry || !cvv || !cardName}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors text-base disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-4 h-4" />}
          {loading ? 'Processando...' : `Pagar ${formatCurrency(total)}`}
        </button>
      </div>
    </div>
  )
}
