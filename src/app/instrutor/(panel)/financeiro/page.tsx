'use client'

import { useEffect, useState } from 'react'
import {
  TrendingUp, TrendingDown, Clock, CheckCircle, Banknote,
  CreditCard, AlertTriangle, Calendar, Loader2,
} from 'lucide-react'

const MESES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez']
const STATUS_LABEL: Record<string, string> = {
  AGENDADA: 'Agendada', CONFIRMADA: 'Confirmada', REALIZADA: 'Realizada', CANCELADA: 'Cancelada',
}
const STATUS_COLOR: Record<string, string> = {
  AGENDADA: 'bg-amber-50 text-amber-700',
  CONFIRMADA: 'bg-blue-50 text-blue-700',
  REALIZADA: 'bg-green-50 text-green-700',
  CANCELADA: 'bg-gray-100 text-gray-500',
}

function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
function fmtData(iso: string) {
  const d = new Date(iso)
  return `${d.getDate().toString().padStart(2,'0')}/${MESES[d.getMonth()]}/${d.getFullYear()}`
}
function iniciais(nome: string) {
  const p = nome.trim().split(' ')
  return (p.length >= 2 ? p[0][0] + p[p.length-1][0] : p[0].slice(0,2)).toUpperCase()
}

export default function FinanceiroPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<'TODOS'|'PLATAFORMA'|'PRESENCIAL'>('TODOS')

  useEffect(() => {
    fetch('/api/instrutor/financeiro')
      .then(r => r.json())
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-green-600" />
    </div>
  )
  if (!data) return null

  const { saldoDevedor, repassePendente, saldoLiquido, plataforma, presencial, historico } = data
  const saldoPositivo = saldoLiquido >= 0

  const historicoFiltrado = historico.filter((a: any) =>
    filtro === 'TODOS' ? a.status !== 'CANCELADA' :
    filtro === 'PLATAFORMA' ? a.modoPagamento === 'PLATAFORMA' && a.status !== 'CANCELADA' :
    a.modoPagamento === 'PRESENCIAL' && a.status !== 'CANCELADA'
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">

      {/* Cabeçalho */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Relatório financeiro
          </h1>
          <p className="text-sm text-gray-500">Visão completa das suas aulas e valores</p>
        </div>
      </div>

      {/* Saldo principal */}
      <div className={`rounded-2xl p-6 mb-6 border-2 ${saldoPositivo ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-3 mb-1">
          {saldoPositivo
            ? <TrendingUp className="w-5 h-5 text-green-600" />
            : <TrendingDown className="w-5 h-5 text-red-600" />}
          <span className={`text-sm font-bold uppercase tracking-wide ${saldoPositivo ? 'text-green-700' : 'text-red-700'}`}>
            {saldoPositivo ? 'A receber da plataforma' : 'Débito com a plataforma'}
          </span>
        </div>
        <p className={`text-4xl font-extrabold mt-1 ${saldoPositivo ? 'text-green-700' : 'text-red-700'}`}
           style={{ fontFamily: 'Plus Jakarta Sans' }}>
          {fmt(Math.abs(saldoLiquido))}
        </p>
        <p className={`text-xs mt-2 ${saldoPositivo ? 'text-green-600' : 'text-red-600'}`}>
          {saldoPositivo
            ? 'Valor acumulado de aulas realizadas via plataforma aguardando repasse.'
            : 'Taxa de aulas presenciais agendadas pela plataforma. Será descontada do próximo repasse ou cobrada separadamente.'}
        </p>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: CreditCard, color: 'bg-blue-50', iconColor: 'text-blue-600',
            label: 'Repasse a receber', val: fmt(repassePendente),
            sub: `${plataforma.aulasRealizadas} aulas via plataforma`,
          },
          {
            icon: CheckCircle, color: 'bg-green-50', iconColor: 'text-green-600',
            label: 'Já repassado', val: fmt(plataforma.repasseLiquidoRecebido),
            sub: 'Pagamentos liberados',
          },
          {
            icon: Banknote, color: 'bg-amber-50', iconColor: 'text-amber-600',
            label: 'Recebido direto', val: fmt(presencial.valorRecebidoDireto),
            sub: `${presencial.aulasRealizadas} aulas presenciais`,
          },
          {
            icon: AlertTriangle, color: 'bg-red-50', iconColor: 'text-red-600',
            label: 'Débito acumulado', val: fmt(saldoDevedor),
            sub: 'Taxa plataforma em aberto',
          },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-2xl border border-gray-100 p-4">
            <div className={`w-8 h-8 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
              <c.icon className={`w-4 h-4 ${c.iconColor}`} />
            </div>
            <div className="text-lg font-extrabold text-gray-900">{c.val}</div>
            <div className="text-xs font-semibold text-gray-700 mt-0.5">{c.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Blocos via plataforma vs presencial */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">

        {/* Via plataforma */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">Aulas via plataforma</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total de aulas</span>
              <span className="font-semibold">{plataforma.totalAulas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Realizadas</span>
              <span className="font-semibold text-green-600">{plataforma.aulasRealizadas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Agendadas</span>
              <span className="font-semibold text-blue-600">{plataforma.aulasAgendadas}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Valor bruto recebido</span>
                <span className="font-semibold">{fmt(plataforma.brutoRecebido)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxa plataforma (10%)</span>
                <span className="font-semibold text-red-600">− {fmt(plataforma.taxaTotal)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-2">
                <span className="text-gray-700 font-bold">Seu líquido</span>
                <span className="font-bold text-green-600">{fmt(plataforma.brutoRecebido - plataforma.taxaTotal)}</span>
              </div>
            </div>
            <div className="bg-blue-50 rounded-xl p-3 mt-2">
              <div className="flex justify-between text-xs">
                <span className="text-blue-700 font-semibold">Aguardando repasse</span>
                <span className="text-blue-800 font-bold">{fmt(plataforma.repasseAguardando)}</span>
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span className="text-blue-700 font-semibold">Já liberado</span>
                <span className="text-blue-800 font-bold">{fmt(plataforma.repasseLiquidoRecebido)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Presencial */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center">
              <Banknote className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm">Aulas presenciais</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Total de aulas</span>
              <span className="font-semibold">{presencial.totalAulas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Realizadas</span>
              <span className="font-semibold text-green-600">{presencial.aulasRealizadas}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Agendadas</span>
              <span className="font-semibold text-blue-600">{presencial.aulasAgendadas}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Recebido direto do aluno</span>
                <span className="font-semibold text-green-600">{fmt(presencial.valorRecebidoDireto)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxa devida (aulas realizadas)</span>
                <span className="font-semibold text-red-600">− {fmt(saldoDevedor)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Taxa futura (agendadas)</span>
                <span className="font-semibold text-amber-600">− {fmt(presencial.taxaPendenteFutura)}</span>
              </div>
            </div>
            {saldoDevedor > 0 && (
              <div className="bg-red-50 rounded-xl p-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed">
                  Você tem <strong>{fmt(saldoDevedor)}</strong> de taxa em aberto com a plataforma. Será descontado automaticamente no próximo repasse.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Histórico de aulas */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <h2 className="font-bold text-gray-900 text-sm">Histórico de aulas</h2>
          </div>
          <div className="flex gap-1.5">
            {(['TODOS','PLATAFORMA','PRESENCIAL'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${filtro === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {f === 'TODOS' ? 'Todos' : f === 'PLATAFORMA' ? '💳 Plataforma' : '💵 Presencial'}
              </button>
            ))}
          </div>
        </div>

        {historicoFiltrado.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-200" />
            Nenhuma aula encontrada.
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {historicoFiltrado.map((a: any) => (
              <div key={a.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                {/* Avatar aluno */}
                <div className="w-9 h-9 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                  {a.alunoAvatar
                    ? <img src={a.alunoAvatar} className="w-full h-full object-cover" alt="" />
                    : iniciais(a.alunoNome)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{a.alunoNome}</p>
                  <p className="text-xs text-gray-400">{fmtData(a.data)}</p>
                </div>

                {/* Modo pagamento */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${a.modoPagamento === 'PLATAFORMA' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>
                  {a.modoPagamento === 'PLATAFORMA' ? '💳 Plataforma' : '💵 Presencial'}
                </span>

                {/* Status */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[a.status]}`}>
                  {STATUS_LABEL[a.status]}
                </span>

                {/* Valores */}
                <div className="text-right shrink-0 min-w-[100px]">
                  {a.status === 'REALIZADA' ? (
                    <>
                      <p className="text-xs text-gray-400 line-through">{fmt(a.totalPago)}</p>
                      <p className="text-sm font-bold text-green-600">
                        {a.modoPagamento === 'PLATAFORMA'
                          ? fmt(a.repasseInstrutor)
                          : fmt(a.totalPago)}
                      </p>
                      {a.modoPagamento === 'PLATAFORMA' && (
                        <p className="text-xs text-gray-400">
                          {a.pagamentoLiberadoEm ? '✓ Repassado' : '⏳ Aguardando'}
                        </p>
                      )}
                      {a.modoPagamento === 'PRESENCIAL' && a.taxaPlataforma > 0 && (
                        <p className="text-xs text-red-500">taxa − {fmt(a.taxaPlataforma)}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-gray-500">{fmt(a.totalPago)}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
