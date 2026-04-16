'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CheckCircle, Pencil, X, Search, Eye } from 'lucide-react'

export function AdminAlunosClient({ alunos }: { alunos: any[] }) {
  const router = useRouter()
  const [loadingBlock, setLoadingBlock] = useState<string | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' })
  const [saving, setSaving] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'ATIVO' | 'BLOQUEADO'>('TODOS')
  const [filtroKYC, setFiltroKYC] = useState('')
  const [perfilAluno, setPerfilAluno] = useState<any>(null)

  const filtrados = alunos.filter(a => {
    const q = busca.toLowerCase()
    if (q && !a.nome?.toLowerCase().includes(q) && !a.email?.toLowerCase().includes(q) && !a.telefone?.includes(q)) return false
    if (filtroStatus === 'ATIVO' && !a.ativo) return false
    if (filtroStatus === 'BLOQUEADO' && a.ativo) return false
    if (filtroKYC && a.kyc?.status !== filtroKYC) return false
    return true
  })

  async function toggleBloquear(id: string, ativo: boolean) {
    setLoadingBlock(id)
    await fetch(`/api/admin/alunos/${id}/bloquear`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    setLoadingBlock(null)
    router.refresh()
  }

  function openEdit(aluno: any) {
    setForm({ nome: aluno.nome ?? '', email: aluno.email ?? '', telefone: aluno.telefone ?? '', cpf: aluno.cpf ?? '' })
    setEditing(aluno)
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    await fetch(`/api/admin/usuarios/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setEditing(null)
    router.refresh()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Alunos <span className="text-base font-semibold text-gray-400">({filtrados.length} de {alunos.length})</span>
        </h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus-within:border-green-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone..."
            className="text-sm bg-transparent outline-none w-60 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-1.5">
          {(['TODOS', 'ATIVO', 'BLOQUEADO'] as const).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroStatus === s ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {s === 'TODOS' ? 'Todos' : s === 'ATIVO' ? 'Ativos' : 'Bloqueados'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[{ val: '', label: 'KYC: todos' }, { val: 'APROVADO', label: 'Aprovado' }, { val: 'PENDENTE', label: 'Pendente' }, { val: 'EM_ANALISE', label: 'Em análise' }, { val: 'REJEITADO', label: 'Rejeitado' }].map(o => (
            <button key={o.val} onClick={() => setFiltroKYC(o.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroKYC === o.val ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cadastro</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Nenhum aluno encontrado.</td></tr>
            )}
            {filtrados.map(a => (
              <tr key={a.id} className={`border-t border-gray-50 hover:bg-gray-50 ${!a.ativo ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{a.nome}</div>
                  {!a.ativo && <div className="text-xs text-red-500 font-semibold">Bloqueado</div>}
                </td>
                <td className="px-5 py-3 text-gray-500">{a.email}</td>
                <td className="px-5 py-3 text-gray-500">{a.telefone ?? '—'}</td>
                <td className="px-5 py-3">
                  {a.kyc ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      a.kyc.status === 'APROVADO' ? 'bg-green-50 text-green-700' :
                      a.kyc.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700' :
                      a.kyc.status === 'EM_ANALISE' ? 'bg-blue-50 text-blue-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {a.kyc.status === 'APROVADO' ? 'Aprovado' :
                       a.kyc.status === 'PENDENTE' ? 'Pendente' :
                       a.kyc.status === 'EM_ANALISE' ? 'Em análise' : 'Rejeitado'}
                    </span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPerfilAluno(a)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver perfil
                    </button>
                    <button
                      onClick={() => openEdit(a)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                    <button
                      onClick={() => toggleBloquear(a.id, a.ativo)}
                      disabled={loadingBlock === a.id}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        a.ativo ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {a.ativo ? <><Ban className="w-3.5 h-3.5" /> Bloquear</> : <><CheckCircle className="w-3.5 h-3.5" /> Desbloquear</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal perfil do aluno */}
      {perfilAluno && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Perfil do aluno</h2>
              <button onClick={() => setPerfilAluno(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {[
                { label: 'Nome', val: perfilAluno.nome },
                { label: 'E-mail', val: perfilAluno.email },
                { label: 'Telefone', val: perfilAluno.telefone ?? '—' },
                { label: 'CPF', val: perfilAluno.cpf ?? '—' },
                { label: 'Gênero', val: perfilAluno.genero ?? '—' },
                { label: 'Status', val: perfilAluno.ativo ? 'Ativo' : 'Bloqueado' },
                { label: 'Cadastro', val: new Date(perfilAluno.createdAt).toLocaleDateString('pt-BR') },
                { label: 'KYC', val: perfilAluno.kyc ? perfilAluno.kyc.status : 'Não enviado' },
              ].map(({ label, val }) => (
                <div key={label} className="flex justify-between border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-500 font-medium">{label}</span>
                  <span className="font-semibold text-gray-900 text-right max-w-[60%] truncate">{val}</span>
                </div>
              ))}
            </div>
            <div className="px-6 pb-6">
              <button
                onClick={() => setPerfilAluno(null)}
                className="w-full py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Editar aluno</h2>
              <button onClick={() => setEditing(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: 'Nome', key: 'nome', type: 'text' },
                { label: 'E-mail', key: 'email', type: 'email' },
                { label: 'Telefone', key: 'telefone', type: 'text' },
                { label: 'CPF', key: 'cpf', type: 'text' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                  />
                </div>
              ))}
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm disabled:opacity-60 transition-colors"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
