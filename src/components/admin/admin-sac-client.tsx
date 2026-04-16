'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Send, MessageCircle, Search } from 'lucide-react'

const STATUS_MAP: Record<string, string> = {
  ABERTO: 'bg-amber-50 text-amber-700',
  EM_ATENDIMENTO: 'bg-blue-50 text-blue-700',
  RESOLVIDO: 'bg-green-50 text-green-700',
  FECHADO: 'bg-gray-100 text-gray-500',
}
const STATUS_LABEL: Record<string, string> = {
  ABERTO: 'Aberto', EM_ATENDIMENTO: 'Em atendimento', RESOLVIDO: 'Resolvido', FECHADO: 'Fechado',
}

export function AdminSACClient({ tickets }: { tickets: any[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<any>(null)
  const [resposta, setResposta] = useState('')
  const [sending, setSending] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('')

  const filtrados = tickets.filter(t => {
    const q = busca.toLowerCase()
    if (q && !t.autor.nome.toLowerCase().includes(q) && !t.titulo.toLowerCase().includes(q)) return false
    if (filtroStatus && t.status !== filtroStatus) return false
    if (filtroTipo && t.autor.role !== filtroTipo) return false
    return true
  })

  async function handleResponder() {
    if (!resposta.trim()) return
    setSending(true)
    await fetch(`/api/tickets/${selected.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: resposta }),
    })
    setSending(false)
    setResposta('')
    router.refresh()
    // Update local state
    setSelected((prev: any) => ({
      ...prev,
      mensagens: [...prev.mensagens, { id: Date.now(), mensagem: resposta, isAdmin: true, autor: { nome: 'Admin', role: 'ADMIN' }, createdAt: new Date() }],
    }))
  }

  async function handleStatus(status: string) {
    await fetch(`/api/tickets/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setSelected((prev: any) => ({ ...prev, status }))
    router.refresh()
  }

  const abertos = tickets.filter(t => t.status === 'ABERTO' || t.status === 'EM_ATENDIMENTO').length

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          SAC — Suporte ao cliente
          {abertos > 0 && (
            <span className="ml-3 text-base font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">{abertos} em aberto</span>
          )}
        </h1>
        <span className="text-sm text-gray-400">{filtrados.length} de {tickets.length}</span>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou assunto..."
            className="pl-9 pr-4 py-2 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm w-60"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-semibold">Status:</span>
          {[['', 'Todos'], ['ABERTO', 'Aberto'], ['EM_ATENDIMENTO', 'Em atendimento'], ['RESOLVIDO', 'Resolvido'], ['FECHADO', 'Fechado']].map(([val, label]) => (
            <button key={val} onClick={() => setFiltroStatus(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroStatus === val ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500 font-semibold">Tipo:</span>
          {[['', 'Todos'], ['ALUNO', 'Aluno'], ['INSTRUTOR', 'Instrutor']].map(([val, label]) => (
            <button key={val} onClick={() => setFiltroTipo(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroTipo === val ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Usuário</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assunto</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Msgs</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Última atualização</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Nenhum ticket encontrado.</td></tr>
            )}
            {filtrados.map(t => (
              <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{t.autor.nome}</div>
                  <div className="text-xs text-gray-400">{t.autor.role === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}</div>
                </td>
                <td className="px-5 py-3 font-medium max-w-xs truncate">{t.titulo}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_MAP[t.status] ?? 'bg-gray-100 text-gray-500'}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">{t.mensagens.length}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(t.updatedAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => setSelected(t)}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> Responder
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-gray-900">{selected.titulo}</h2>
                <p className="text-xs text-gray-500">{selected.autor.nome} · {selected.autor.role === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected.status !== 'RESOLVIDO' && selected.status !== 'FECHADO' && (
                  <button onClick={() => handleStatus('RESOLVIDO')} className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                    Marcar resolvido
                  </button>
                )}
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
              {selected.mensagens.map((m: any) => (
                <div key={m.id} className={`flex ${m.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${m.isAdmin ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                    <p className={`text-xs font-semibold mb-1 ${m.isAdmin ? 'text-green-100' : 'text-gray-500'}`}>{m.isAdmin ? 'Admin' : m.autor.nome}</p>
                    <p className="leading-relaxed">{m.mensagem}</p>
                    <p className={`text-xs mt-1 ${m.isAdmin ? 'text-green-200' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply box */}
            {selected.status !== 'RESOLVIDO' && selected.status !== 'FECHADO' && (
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <textarea
                  value={resposta}
                  onChange={e => setResposta(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleResponder() } }}
                  placeholder="Escreva sua resposta... (Enter para enviar)"
                  rows={2}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none"
                />
                <button
                  onClick={handleResponder} disabled={sending || !resposta.trim()}
                  className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
