'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'

const STARS = [1, 2, 3, 4, 5]

export function AdminAvaliacoesClient({ avaliacoes }: { avaliacoes: any[] }) {
  const [busca, setBusca] = useState('')
  const [filtroNota, setFiltroNota] = useState<number | null>(null)

  const filtradas = avaliacoes.filter(a => {
    const q = busca.toLowerCase()
    if (q && !a.autor.nome.toLowerCase().includes(q) && !a.alvo.nome.toLowerCase().includes(q)) return false
    if (filtroNota !== null && a.nota !== filtroNota) return false
    return true
  })

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Avaliações <span className="text-base font-semibold text-gray-400">({filtradas.length} de {avaliacoes.length})</span>
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-9 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm w-56"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-semibold">Nota:</span>
          <button
            onClick={() => setFiltroNota(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroNota === null ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Todas
          </button>
          {STARS.map(n => (
            <button
              key={n}
              onClick={() => setFiltroNota(filtroNota === n ? null : n)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroNota === n ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {'★'.repeat(n)}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Autor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avaliado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nota</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Comentário</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Nenhuma avaliação encontrada.</td></tr>
            ) : filtradas.map(a => (
              <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{a.autor.nome}</td>
                <td className="px-5 py-3 text-gray-600">{a.alvo.nome}</td>
                <td className="px-5 py-3 font-bold">
                  <span className="text-amber-400">{'★'.repeat(a.nota)}</span>
                  <span className="text-gray-200">{'★'.repeat(5 - a.nota)}</span>
                </td>
                <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{a.comentario || '—'}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
