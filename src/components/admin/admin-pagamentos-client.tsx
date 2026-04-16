'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  ATIVA: 'Ativa', CANCELADA: 'Cancelada', EXPIRADA: 'Expirada', TRIAL: 'Trial',
}
const STATUS_COLOR: Record<string, string> = {
  ATIVA: 'bg-green-50 text-green-700',
  TRIAL: 'bg-blue-50 text-blue-700',
  CANCELADA: 'bg-red-50 text-red-700',
  EXPIRADA: 'bg-gray-100 text-gray-500',
}

export function AdminPagamentosClient({ subscriptions }: { subscriptions: any[] }) {
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroPlano, setFiltroPlano] = useState('')

  const planos = [...new Set(subscriptions.map(s => s.plano))].filter(Boolean)

  const filtradas = subscriptions.filter(s => {
    const q = busca.toLowerCase()
    if (q && !s.instrutor.user.nome?.toLowerCase().includes(q) && !s.instrutor.user.email?.toLowerCase().includes(q)) return false
    if (filtroStatus && s.status !== filtroStatus) return false
    if (filtroPlano && s.plano !== filtroPlano) return false
    return true
  })

  const totalReceita = filtradas.filter(s => s.status === 'ATIVA').reduce((sum, s) => sum + s.valorMensal, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Pagamentos e assinaturas <span className="text-base font-semibold text-gray-400">({filtradas.length} de {subscriptions.length})</span>
          </h1>
          {filtroStatus === 'ATIVA' || filtroStatus === '' ? (
            <p className="text-sm text-green-600 font-semibold mt-0.5">
              Receita mensal (ativas): R$ {totalReceita.toFixed(2).replace('.', ',')}
            </p>
          ) : null}
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar instrutor..."
            className="pl-9 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm w-56"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-semibold">Status:</span>
          {['', 'ATIVA', 'TRIAL', 'CANCELADA', 'EXPIRADA'].map(s => (
            <button
              key={s}
              onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroStatus === s ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {s === '' ? 'Todos' : STATUS_LABEL[s]}
            </button>
          ))}
        </div>

        {planos.length > 1 && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-semibold">Plano:</span>
            <button
              onClick={() => setFiltroPlano('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroPlano === '' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              Todos
            </button>
            {planos.map(p => (
              <button
                key={p}
                onClick={() => setFiltroPlano(filtroPlano === p ? '' : p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${filtroPlano === p ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Instrutor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor/mês</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Início</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Fim / Cancelamento</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Nenhuma assinatura encontrada.</td></tr>
            ) : filtradas.map(s => (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{s.instrutor.user.nome}</div>
                  <div className="text-xs text-gray-400">{s.instrutor.user.email}</div>
                </td>
                <td className="px-5 py-3 text-gray-600 capitalize">{s.plano}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLOR[s.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-semibold text-gray-900">
                  R$ {s.valorMensal.toFixed(2).replace('.', ',')}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {s.inicioEm ? new Date(s.inicioEm).toLocaleDateString('pt-BR') : '—'}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {s.canceladoEm ? new Date(s.canceladoEm).toLocaleDateString('pt-BR') :
                   s.fimEm ? new Date(s.fimEm).toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
