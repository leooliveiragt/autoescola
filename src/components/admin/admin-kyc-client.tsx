'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, FileText, CheckCircle, XCircle, Eye, Search } from 'lucide-react'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    APROVADO: 'bg-green-50 text-green-700',
    PENDENTE: 'bg-amber-50 text-amber-700',
    EM_ANALISE: 'bg-blue-50 text-blue-700',
    REJEITADO: 'bg-red-50 text-red-700',
  }
  const label: Record<string, string> = {
    APROVADO: 'Aprovado', PENDENTE: 'Pendente', EM_ANALISE: 'Em análise', REJEITADO: 'Rejeitado',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${map[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {label[status] ?? status}
    </span>
  )
}

export function AdminKYCClient({ kycs }: { kycs: any[] }) {
  const router = useRouter()
  const [tab, setTab] = useState<'INSTRUTOR' | 'ALUNO'>('INSTRUTOR')
  const [selected, setSelected] = useState<any>(null)
  const [observacao, setObservacao] = useState('')
  const [loading, setLoading] = useState(false)
  const [modalError, setModalError] = useState('')

  const [busca, setBusca] = useState('')

  const filtrados = kycs.filter(k => {
    if (k.user.role !== tab) return false
    const q = busca.toLowerCase()
    if (q && !k.user.nome?.toLowerCase().includes(q) && !k.user.email?.toLowerCase().includes(q)) return false
    return true
  })

  async function handleKYC(id: string, status: string) {
    setModalError('')
    setLoading(true)
    const res = await fetch(`/api/admin/kyc/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, observacao }),
    })
    setLoading(false)
    if (!res.ok) {
      const d = await res.json()
      setModalError(d.error ?? 'Erro ao atualizar KYC.')
      return
    }
    setSelected(null)
    setObservacao('')
    setModalError('')
    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Fila de verificação KYC
          <span className="ml-3 text-base font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
            {kycs.filter(k => k.status === 'PENDENTE').length} pendentes
          </span>
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {(['INSTRUTOR', 'ALUNO'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {t === 'INSTRUTOR' ? 'Instrutores' : 'Alunos'}
            <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${tab === t ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-500'}`}>
              {kycs.filter(k => k.user.role === t && k.status === 'PENDENTE').length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus-within:border-green-400 transition-colors w-fit">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar por nome ou e-mail..."
          className="text-sm bg-transparent outline-none w-56 placeholder-gray-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Enviado em</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Nenhum KYC nesta aba.</td></tr>
            )}
            {filtrados.map(k => (
              <tr key={k.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{k.user.nome}</td>
                <td className="px-5 py-3"><StatusBadge status={k.status} /></td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(k.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => { setSelected(k); setObservacao(k.observacaoAdmin ?? '') }}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Visualizar
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
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">{selected.user.nome}</h2>
                <p className="text-xs text-gray-500">{selected.user.email} · {selected.user.role === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selected.status} />
                <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Documents grid */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Documentos enviados</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Documento (frente)', url: selected.docFrenteUrl },
                    { label: 'Documento (verso)', url: selected.docVersoUrl },
                    { label: 'Comprovante de endereço', url: selected.comprovanteUrl },
                    { label: 'Selfie', url: selected.selfieUrl },
                  ].map(doc => (
                    <div key={doc.label} className="border border-gray-200 rounded-2xl overflow-hidden">
                      <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-600">{doc.label}</div>
                      {doc.url ? (
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block">
                          <img src={doc.url} alt={doc.label} className="w-full h-36 object-cover hover:opacity-90 transition-opacity" />
                        </a>
                      ) : (
                        <div className="h-36 flex items-center justify-center text-gray-300">
                          <FileText className="w-8 h-8" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* User details */}
              <div className="bg-gray-50 rounded-2xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">CPF</span><span className="font-medium">{selected.user.cpf ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Telefone</span><span className="font-medium">{selected.user.telefone ?? '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Cadastrado em</span><span className="font-medium">{new Date(selected.user.createdAt).toLocaleDateString('pt-BR')}</span></div>
                {selected.analisadoEm && (
                  <div className="flex justify-between"><span className="text-gray-500">Analisado em</span><span className="font-medium">{new Date(selected.analisadoEm).toLocaleDateString('pt-BR')}</span></div>
                )}
              </div>

              {/* Observação */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                  Observação <span className="text-red-500 font-bold">(obrigatória para reprovar)</span>
                </label>
                <textarea
                  value={observacao}
                  onChange={e => setObservacao(e.target.value)}
                  placeholder="Descreva o motivo da rejeição. O usuário receberá esta mensagem via WhatsApp."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none"
                />
              </div>

              {modalError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{modalError}</p>
              )}

              {/* Actions */}
              {(selected.status === 'PENDENTE' || selected.status === 'EM_ANALISE') && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleKYC(selected.id, 'APROVADO')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-60"
                  >
                    <CheckCircle className="w-4 h-4" /> Aprovar
                  </button>
                  <button
                    onClick={() => handleKYC(selected.id, 'EM_ANALISE')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors text-sm disabled:opacity-60"
                  >
                    Em análise
                  </button>
                  <button
                    onClick={() => handleKYC(selected.id, 'REJEITADO')}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-700 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm disabled:opacity-60"
                  >
                    <XCircle className="w-4 h-4" /> Rejeitar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
