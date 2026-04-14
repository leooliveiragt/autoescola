'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard, CheckCircle, XCircle, ShieldCheck, Loader2, X, AlertTriangle, RefreshCw, Copy, Check,
} from 'lucide-react'

function CardForm({
  onSubmit,
  loading,
  submitLabel,
}: {
  onSubmit: (dados: { cartaoNumero: string; cartaoValidade: string; cartaoCvv: string; cartaoNome: string }) => void
  loading: boolean
  submitLabel: string
}) {
  const [cartaoNumero, setCartaoNumero] = useState('')
  const [cartaoValidade, setCartaoValidade] = useState('')
  const [cartaoCvv, setCartaoCvv] = useState('')
  const [cartaoNome, setCartaoNome] = useState('')

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Número do cartão</label>
        <input
          type="text"
          value={cartaoNumero}
          onChange={e => setCartaoNumero(e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim())}
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
            value={cartaoValidade}
            onChange={e => {
              const v = e.target.value.replace(/\D/g, '').slice(0, 4)
              setCartaoValidade(v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v)
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
            value={cartaoCvv}
            onChange={e => setCartaoCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
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
          value={cartaoNome}
          onChange={e => setCartaoNome(e.target.value.toUpperCase())}
          placeholder="COMO ESCRITO NO CARTÃO"
          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono"
        />
      </div>
      <button
        onClick={() => onSubmit({ cartaoNumero, cartaoValidade, cartaoCvv, cartaoNome })}
        disabled={loading || !cartaoNumero || !cartaoValidade || !cartaoCvv || !cartaoNome}
        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
        {loading ? 'Processando...' : submitLabel}
      </button>
      <p className="text-center text-xs text-gray-400">🔒 Pagamento seguro e criptografado.</p>
    </div>
  )
}

function PixForm({
  pixChave,
  mensalidade,
  onConfirmar,
  loading,
}: {
  pixChave: string
  mensalidade: number
  onConfirmar: () => void
  loading: boolean
}) {
  const [copiado, setCopiado] = useState(false)

  function copiar() {
    navigator.clipboard.writeText(pixChave)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
        <p className="text-xs text-green-700 mb-1 font-semibold uppercase tracking-wide">Valor a pagar</p>
        <p className="text-3xl font-extrabold text-green-800">
          R$ {mensalidade.toFixed(2).replace('.', ',')}
        </p>
        <p className="text-xs text-green-600 mt-1">Mensalidade DirigêJá</p>
      </div>

      {pixChave ? (
        <>
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Chave PIX</p>
            <div className="flex items-center gap-2 p-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
              <span className="flex-1 text-sm font-mono text-gray-800 break-all">{pixChave}</span>
              <button
                onClick={copiar}
                className="shrink-0 p-1.5 rounded-lg bg-white border border-gray-200 hover:border-green-400 transition-colors"
              >
                {copiado
                  ? <Check className="w-4 h-4 text-green-600" />
                  : <Copy className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
            {copiado && <p className="text-xs text-green-600 mt-1">Chave copiada!</p>}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 space-y-1">
            <p className="font-semibold">Como pagar:</p>
            <p>1. Abra o app do seu banco e escolha PIX</p>
            <p>2. Cole a chave acima e confirme o valor</p>
            <p>3. Clique em "Já realizei o PIX" abaixo</p>
            <p>4. Nossa equipe confirmará em até 1 dia útil</p>
          </div>
        </>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-center">
          Chave PIX não configurada. Entre em contato com o suporte.
        </div>
      )}

      <button
        onClick={onConfirmar}
        disabled={loading || !pixChave}
        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
        {loading ? 'Registrando...' : 'Já realizei o PIX'}
      </button>
      <p className="text-center text-xs text-gray-400">Seu acesso será liberado após a confirmação do pagamento.</p>
    </div>
  )
}

interface Props {
  subscription: any
  mensalidade: number
  pixChave: string
}

export function AssinaturaClient({ subscription: initialSub, mensalidade, pixChave }: Props) {
  const router = useRouter()
  const [sub, setSub] = useState(initialSub)
  const [modal, setModal] = useState<'assinar' | 'trocar_cartao' | 'cancelar' | null>(null)
  const [abaModal, setAbaModal] = useState<'cartao' | 'pix'>('cartao')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Só conta como "ativo" se tiver pagamento cadastrado
  const isPix = sub?.cartaoBandeira === 'PIX'
  const temPagamento = sub?.status === 'ATIVA' || isPix
  const isAtiva = temPagamento

  async function handleAssinar(dados: any) {
    setLoading(true)
    setErro('')
    const res = await fetch('/api/instrutor/assinatura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
    const json = await res.json()
    setLoading(false)
    if (res.ok) {
      setSub(json.subscription)
      setModal(null)
      router.refresh()
    } else {
      setErro(json.error ?? 'Erro ao processar assinatura.')
    }
  }

  async function handleAssinarPix() {
    setLoading(true)
    setErro('')
    const res = await fetch('/api/instrutor/assinatura', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metodoPagamento: 'PIX' }),
    })
    const json = await res.json()
    setLoading(false)
    if (res.ok) {
      setSub(json.subscription)
      setModal(null)
      router.refresh()
    } else {
      setErro(json.error ?? 'Erro ao registrar PIX.')
    }
  }

  async function handleTrocarCartao(dados: any) {
    setLoading(true)
    setErro('')
    const res = await fetch('/api/instrutor/assinatura', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'trocar_cartao', ...dados }),
    })
    const json = await res.json()
    setLoading(false)
    if (res.ok) {
      setSub(json.subscription)
      setModal(null)
      router.refresh()
    } else {
      setErro(json.error ?? 'Erro ao trocar cartão.')
    }
  }

  async function handleCancelar() {
    setLoading(true)
    setErro('')
    const res = await fetch('/api/instrutor/assinatura', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ acao: 'cancelar' }),
    })
    const json = await res.json()
    setLoading(false)
    if (res.ok) {
      setSub(json.subscription)
      setModal(null)
      router.refresh()
    } else {
      setErro(json.error ?? 'Erro ao cancelar.')
    }
  }

  function abrirAssinar() {
    setErro('')
    setAbaModal('cartao')
    setModal('assinar')
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        Minha assinatura
      </h1>
      <p className="text-sm text-gray-500 mb-8">Gerencie seu plano e dados de pagamento.</p>

      {/* Status card */}
      {isAtiva ? (
        <div className="bg-white rounded-2xl border-2 border-green-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <h2 className="font-bold text-gray-900">Plano ativo</h2>
            </div>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              sub.status === 'ATIVA' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
            }`}>
              {sub.status === 'ATIVA' ? 'Ativo' : 'Aguardando confirmação do PIX'}
            </span>
          </div>

          <div className="space-y-3 mb-5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plano</span>
              <span className="font-semibold text-gray-900 capitalize">{sub.plano}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Valor</span>
              <span className="font-bold text-green-600">
                R$ {mensalidade.toFixed(2).replace('.', ',')}/mês
              </span>
            </div>
            {sub.inicioEm && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Ativo desde</span>
                <span className="font-medium">{new Date(sub.inicioEm).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            {sub.fimEm && sub.status === 'ATIVA' && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Próxima cobrança</span>
                <span className="font-medium">{new Date(sub.fimEm).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
          </div>

          {/* Pagamento cadastrado */}
          {isPix ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">PIX</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Pagamento via PIX</p>
                    <p className="text-xs text-amber-600 font-medium">Aguardando confirmação da equipe</p>
                  </div>
                </div>
                <button
                  onClick={() => { setErro(''); setAbaModal('cartao'); setModal('trocar_cartao') }}
                  className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Usar cartão
                </button>
              </div>
            </div>
          ) : sub.cartaoFinal ? (
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {sub.cartaoBandeira} •••• {sub.cartaoFinal}
                    </p>
                    {sub.cartaoNome && (
                      <p className="text-xs text-gray-500">{sub.cartaoNome}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => { setErro(''); setModal('trocar_cartao') }}
                  className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Trocar
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5">
              <p className="text-xs text-amber-700">Nenhuma forma de pagamento cadastrada. Adicione um cartão ou pague via PIX.</p>
              <button
                onClick={abrirAssinar}
                className="text-xs font-semibold text-amber-700 underline mt-1"
              >
                Adicionar pagamento
              </button>
            </div>
          )}

          <button
            onClick={() => { setErro(''); setModal('cancelar') }}
            className="w-full py-2.5 border-2 border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 text-sm transition-colors"
          >
            Cancelar assinatura
          </button>
        </div>
      ) : sub?.status === 'CANCELADA' ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-red-800">Assinatura cancelada</h2>
          </div>
          <p className="text-sm text-red-700 mb-1">
            Sua assinatura foi cancelada
            {sub.canceladoEm ? ` em ${new Date(sub.canceladoEm).toLocaleDateString('pt-BR')}` : ''}.
          </p>
          {sub.fimEm && new Date(sub.fimEm) > new Date() && (
            <p className="text-xs text-red-600 mb-4">
              Você mantém acesso até {new Date(sub.fimEm).toLocaleDateString('pt-BR')}.
            </p>
          )}
          <button
            onClick={abrirAssinar}
            className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm transition-colors"
          >
            Reativar assinatura
          </button>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
          <p className="text-sm text-amber-800 font-medium">Você ainda não tem uma assinatura ativa.</p>
          <p className="text-xs text-amber-700 mt-1">Assine para aparecer nas buscas dos alunos.</p>
        </div>
      )}

      {/* Plan card (shown when no active sub) */}
      {!isAtiva && (
        <div className="bg-white rounded-2xl border-2 border-green-500 p-6 mb-6">
          <span className="text-xs font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full mb-4 inline-block">
            Único plano disponível
          </span>
          <div className="mb-1 font-bold text-gray-800">Plano Mensal</div>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-4xl font-extrabold text-gray-900">
              R$ {mensalidade.toFixed(0)}
            </span>
            <span className="text-sm text-gray-500 mb-1">/mês</span>
          </div>
          <ul className="text-xs text-gray-500 space-y-1.5 mb-5 mt-3">
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> Perfil visível nas buscas de alunos</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> Receba agendamentos ilimitados</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> Painel completo de gestão</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> Cancele a qualquer momento</li>
          </ul>
          <button
            onClick={abrirAssinar}
            className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
          >
            Assinar agora
          </button>
        </div>
      )}

      {/* Modal assinar / reativar */}
      {(modal === 'assinar') && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-gray-900">Escolha a forma de pagamento</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  R$ {mensalidade.toFixed(2).replace('.', ',')}/mês · Cancele quando quiser
                </p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Abas */}
            <div className="flex border-b border-gray-100">
              <button
                onClick={() => setAbaModal('cartao')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${abaModal === 'cartao' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                💳 Cartão de crédito
              </button>
              <button
                onClick={() => setAbaModal('pix')}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${abaModal === 'pix' ? 'text-green-600 border-b-2 border-green-500' : 'text-gray-500 hover:text-gray-700'}`}
              >
                PIX
              </button>
            </div>

            <div className="p-6">
              {erro && <p className="text-sm text-red-600 mb-4 text-center">{erro}</p>}
              {abaModal === 'cartao' ? (
                <CardForm onSubmit={handleAssinar} loading={loading} submitLabel={`Assinar · R$ ${mensalidade.toFixed(0)}/mês`} />
              ) : (
                <PixForm pixChave={pixChave} mensalidade={mensalidade} onConfirmar={handleAssinarPix} loading={loading} />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal trocar cartão */}
      {modal === 'trocar_cartao' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Trocar cartão</h2>
              <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              {erro && <p className="text-sm text-red-600 mb-4 text-center">{erro}</p>}
              <CardForm onSubmit={handleTrocarCartao} loading={loading} submitLabel="Salvar novo cartão" />
            </div>
          </div>
        </div>
      )}

      {/* Modal cancelar */}
      {modal === 'cancelar' && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h2 className="text-lg font-extrabold text-gray-900 mb-2">Cancelar assinatura?</h2>
              <p className="text-sm text-gray-500">
                Seu perfil ficará invisível para os alunos e você perderá acesso ao painel após o período já pago.
              </p>
            </div>
            {erro && <p className="text-sm text-red-600 mb-3 text-center">{erro}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 text-sm transition-colors"
              >
                Manter plano
              </button>
              <button
                onClick={handleCancelar}
                disabled={loading}
                className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 text-sm flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? 'Cancelando...' : 'Sim, cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
