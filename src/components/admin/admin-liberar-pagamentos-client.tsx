'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Lock, Search } from 'lucide-react'

export function AdminLiberarPagamentosClient({ aulas, semanaInicio, semanaFim }: { aulas: any[], semanaInicio: string, semanaFim: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [busca, setBusca] = useState('')
  const [filtroVis, setFiltroVis] = useState<'TODOS' | 'PENDENTES' | 'LIBERADOS' | 'RETIDOS'>('TODOS')

  const fmt = (iso: string) => new Date(iso).toLocaleDateString('pt-BR')
  const fmtMoeda = (v: number) => `R$${v.toFixed(2).replace('.', ',')}`

  async function handleLiberar(aulaId: string) {
    setLoading(aulaId)
    const res = await fetch('/api/admin/pagamentos/liberar', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId }),
    })
    setLoading(null)
    if (res.ok) router.refresh()
    else {
      const data = await res.json()
      alert(data.error || 'Erro ao liberar pagamento')
    }
  }

  const aulasFiltradas = aulas.filter(a => {
    if (busca) {
      const q = busca.toLowerCase()
      if (!a.instrutor.nome?.toLowerCase().includes(q) && !a.aluno.nome?.toLowerCase().includes(q)) return false
    }
    const eRetido = a.reclamacao && (a.reclamacao.status === 'ABERTA' || a.reclamacao.status === 'EM_ANALISE')
    const eLiberado = !!a.pagamentoLiberadoEm
    const ePendente = !eRetido && !eLiberado
    if (filtroVis === 'PENDENTES' && !ePendente) return false
    if (filtroVis === 'LIBERADOS' && !eLiberado) return false
    if (filtroVis === 'RETIDOS' && !eRetido) return false
    return true
  })
  const pendentes = aulasFiltradas.filter(a => !a.pagamentoLiberadoEm && (!a.reclamacao || a.reclamacao.status === 'RESOLVIDA'))
  const liberados = aulasFiltradas.filter(a => !!a.pagamentoLiberadoEm)
  const retidos = aulasFiltradas.filter(a => a.reclamacao && (a.reclamacao.status === 'ABERTA' || a.reclamacao.status === 'EM_ANALISE'))
  const totalPendente = pendentes.reduce((s, a) => s + a.totalPago, 0)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Liberação de pagamentos</h1>
      <p className="text-sm text-gray-500 mb-4">
        Semana de {fmt(semanaInicio)} a {fmt(semanaFim)} · Liberações ocorrem às quartas-feiras da semana seguinte às aulas.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por instrutor ou aluno..."
            className="pl-9 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm w-72"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {([
            ['TODOS',    'Todos',      ''],
            ['PENDENTES','Pendentes',  'text-amber-600'],
            ['LIBERADOS','Liberados',  'text-green-600'],
            ['RETIDOS',  'Retidos',    'text-red-600'],
          ] as const).map(([val, label, color]) => (
            <button
              key={val}
              onClick={() => setFiltroVis(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filtroVis === val ? 'bg-green-600 text-white' : `bg-gray-100 ${color || 'text-gray-600'} hover:bg-gray-200`
              }`}
            >
              {label}
              {val === 'PENDENTES' && pendentes.length > 0 && filtroVis !== 'PENDENTES' && (
                <span className="ml-1 bg-amber-100 text-amber-700 rounded-full px-1.5">{pendentes.length}</span>
              )}
              {val === 'RETIDOS' && retidos.length > 0 && filtroVis !== 'RETIDOS' && (
                <span className="ml-1 bg-red-100 text-red-700 rounded-full px-1.5">{retidos.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-extrabold text-green-600">{fmtMoeda(totalPendente)}</div>
          <div className="text-xs text-gray-500 mt-0.5">Total a liberar</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-extrabold text-gray-900">{pendentes.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Pagamentos pendentes</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="text-2xl font-extrabold text-red-500">{retidos.length}</div>
          <div className="text-xs text-gray-500 mt-0.5">Retidos por reclamação</div>
        </div>
      </div>

      {liberados.length > 0 && (filtroVis === 'TODOS' || filtroVis === 'LIBERADOS') && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Repasses já liberados ({liberados.length})
          </h2>
          <div className="bg-white rounded-2xl border border-green-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-green-50 border-b border-green-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-green-700 uppercase tracking-wide">Instrutor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-green-700 uppercase tracking-wide">Aluno</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-green-700 uppercase tracking-wide">Data aula</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-green-700 uppercase tracking-wide">Total pago</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-green-700 uppercase tracking-wide">Liberado em</th>
                </tr>
              </thead>
              <tbody>
                {liberados.map(a => (
                  <tr key={a.id} className="border-t border-green-50">
                    <td className="px-5 py-3 font-medium">{a.instrutor.nome}</td>
                    <td className="px-5 py-3 text-gray-500">{a.aluno.nome}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(a.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{fmtMoeda(a.totalPago)}</td>
                    <td className="px-5 py-3 text-xs text-green-700 font-semibold">{fmt(a.pagamentoLiberadoEm)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {retidos.length > 0 && (filtroVis === 'TODOS' || filtroVis === 'RETIDOS') && (
        <div className="mb-6">
          <h2 className="text-sm font-bold text-red-600 mb-3 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Pagamentos retidos por reclamação
          </h2>
          <div className="bg-white rounded-2xl border border-red-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-red-50 border-b border-red-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-red-500 uppercase tracking-wide">Instrutor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-red-500 uppercase tracking-wide">Aluno</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-red-500 uppercase tracking-wide">Data aula</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-red-500 uppercase tracking-wide">Valor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-red-500 uppercase tracking-wide">Reclamação</th>
                </tr>
              </thead>
              <tbody>
                {retidos.map(a => (
                  <tr key={a.id} className="border-t border-red-50">
                    <td className="px-5 py-3 font-medium">{a.instrutor.nome}</td>
                    <td className="px-5 py-3 text-gray-500">{a.aluno.nome}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(a.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{fmtMoeda(a.totalPago)}</td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700">{a.reclamacao.status}</span>
                      <p className="text-xs text-gray-400 mt-0.5 max-w-xs truncate">{a.reclamacao.descricao}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {(filtroVis === 'TODOS' || filtroVis === 'PENDENTES') && (
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" /> Prontos para liberar
        </h2>
        {pendentes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
            Nenhum pagamento pendente para esta semana.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Instrutor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aluno</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data aula</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Duração</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total pago</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
                </tr>
              </thead>
              <tbody>
                {pendentes.map(a => (
                  <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3 font-medium">{a.instrutor.nome}</td>
                    <td className="px-5 py-3 text-gray-500">{a.aluno.nome}</td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{new Date(a.data).toLocaleDateString('pt-BR')}</td>
                    <td className="px-5 py-3 text-gray-500">{a.duracaoHoras}h</td>
                    <td className="px-5 py-3 font-semibold text-gray-900">{fmtMoeda(a.totalPago)}</td>
                    <td className="px-5 py-3">
                      {a.reclamacao ? (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">Resolvida</span>
                      ) : (
                        <span className="text-xs text-gray-400">Sem reclamação</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleLiberar(a.id)}
                        disabled={loading === a.id}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {loading === a.id ? 'Liberando...' : 'Liberar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {(filtroVis === 'TODOS' || filtroVis === 'PENDENTES') && pendentes.length > 1 && (
        <button
          onClick={() => pendentes.forEach(a => handleLiberar(a.id))}
          className="mt-4 flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm"
        >
          <CheckCircle className="w-4 h-4" /> Liberar todos ({pendentes.length}) — {fmtMoeda(totalPendente)}
        </button>
      )}
    </div>
  )
}
