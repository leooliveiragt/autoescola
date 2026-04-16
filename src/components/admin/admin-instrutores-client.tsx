'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CheckCircle, Pencil, X, Search, TrendingDown, Loader2, Copy, Check, Eye } from 'lucide-react'

export function AdminInstrutoresClient({ instrutores }: { instrutores: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [editing, setEditing] = useState<any>(null)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '' })
  const [saving, setSaving] = useState(false)
  const [busca, setBusca] = useState('')
  const [filtroKYC, setFiltroKYC] = useState('')
  const [filtroSub, setFiltroSub] = useState('')
  const [filtroVisivel, setFiltroVisivel] = useState('')
  const [filtroDivida, setFiltroDivida] = useState(false)
  const [cobrancaResult, setCobrancaResult] = useState<{ instrutorId: string; data: any } | null>(null)
  const [cobrancaLoading, setCobrancaLoading] = useState<string | null>(null)
  const [pixCopiado, setPixCopiado] = useState(false)

  const filtrados = instrutores.filter(i => {
    const q = busca.toLowerCase()
    if (q && !i.user.nome?.toLowerCase().includes(q) && !i.user.email?.toLowerCase().includes(q)) return false
    if (filtroKYC && i.user.kyc?.status !== filtroKYC) return false
    if (filtroSub && i.subscription?.status !== filtroSub) return false
    if (filtroVisivel === 'SIM' && !i.visivel) return false
    if (filtroVisivel === 'NAO' && i.visivel) return false
    if (filtroDivida && !(i.saldoDevedor > 0)) return false
    return true
  })

  async function toggleBloquear(id: string, ativo: boolean) {
    setLoading(id)
    await fetch(`/api/admin/instrutores/${id}/bloquear`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ativo: !ativo }),
    })
    setLoading(null)
    router.refresh()
  }

  function openEdit(instrutor: any) {
    setForm({ nome: instrutor.user.nome ?? '', email: instrutor.user.email ?? '', telefone: instrutor.user.telefone ?? '', cpf: instrutor.user.cpf ?? '' })
    setEditing(instrutor)
  }

  async function handleSave() {
    if (!editing) return
    setSaving(true)
    await fetch(`/api/admin/usuarios/${editing.user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setEditing(null)
    router.refresh()
  }

  async function cobrarInstrutor(perfilId: string) {
    setCobrancaLoading(perfilId)
    setCobrancaResult(null)
    setPixCopiado(false)
    const res = await fetch(`/api/admin/instrutores/${perfilId}/cobrar`, { method: 'POST' })
    const data = await res.json()
    setCobrancaResult({ instrutorId: perfilId, data })
    setCobrancaLoading(null)
    if (data.metodo === 'cartao' && data.status === 'sucesso') router.refresh()
  }

  function copiarPix(chave: string) {
    navigator.clipboard.writeText(chave)
    setPixCopiado(true)
    setTimeout(() => setPixCopiado(false), 2000)
  }

  const totalDivida = instrutores.reduce((s, i) => s + (i.saldoDevedor ?? 0), 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Instrutores <span className="text-base font-semibold text-gray-400">({filtrados.length} de {instrutores.length})</span>
        </h1>
        {totalDivida > 0 && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <span className="text-sm font-bold text-red-700">Total a cobrar: R$ {totalDivida.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus-within:border-green-400 transition-colors">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="text-sm bg-transparent outline-none w-56 placeholder-gray-400"
          />
        </div>
        <div className="flex gap-1.5">
          {[{ val: '', label: 'KYC: todos' }, { val: 'APROVADO', label: 'Aprovado' }, { val: 'PENDENTE', label: 'Pendente' }, { val: 'EM_ANALISE', label: 'Em análise' }, { val: 'REJEITADO', label: 'Rejeitado' }].map(o => (
            <button key={o.val} onClick={() => setFiltroKYC(o.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroKYC === o.val ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[{ val: '', label: 'Assinatura: todas' }, { val: 'ATIVA', label: 'Ativa' }, { val: 'TRIAL', label: 'Trial' }, { val: 'CANCELADA', label: 'Cancelada' }].map(o => (
            <button key={o.val} onClick={() => setFiltroSub(o.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroSub === o.val ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5">
          {[{ val: '', label: 'Visível: todos' }, { val: 'SIM', label: 'Visível' }, { val: 'NAO', label: 'Oculto' }].map(o => (
            <button key={o.val} onClick={() => setFiltroVisivel(o.val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroVisivel === o.val ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}>
              {o.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setFiltroDivida(v => !v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroDivida ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
        >
          <TrendingDown className="w-3.5 h-3.5" /> Com débito
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Assinatura</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Visível</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Débito</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-10 text-center text-gray-400">Nenhum instrutor encontrado.</td></tr>
            ) : filtrados.map(i => (
              <tr key={i.id} className={`border-t border-gray-50 hover:bg-gray-50 ${!i.user.ativo ? 'opacity-50' : ''}`}>
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{i.user.nome}</div>
                  {!i.user.ativo && <div className="text-xs text-red-500 font-semibold">Bloqueado</div>}
                </td>
                <td className="px-5 py-3 text-gray-500">{i.user.email}</td>
                <td className="px-5 py-3">
                  {i.user.kyc ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      i.user.kyc.status === 'APROVADO' ? 'bg-green-50 text-green-700' :
                      i.user.kyc.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700' :
                      i.user.kyc.status === 'EM_ANALISE' ? 'bg-blue-50 text-blue-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {i.user.kyc.status === 'APROVADO' ? 'Aprovado' :
                       i.user.kyc.status === 'PENDENTE' ? 'Pendente' :
                       i.user.kyc.status === 'EM_ANALISE' ? 'Em análise' : 'Rejeitado'}
                    </span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3">
                  {i.subscription ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      i.subscription.status === 'ATIVA' ? 'bg-green-50 text-green-700' :
                      i.subscription.status === 'TRIAL' ? 'bg-blue-50 text-blue-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {i.subscription.status}
                    </span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${i.visivel ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {i.visivel ? 'Sim' : 'Não'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {i.saldoDevedor > 0 ? (
                    <span className="text-xs font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-full">
                      R$ {i.saldoDevedor.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/instrutor/${i.id}`)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Ver perfil
                    </button>
                    <button
                      onClick={() => openEdit(i)}
                      className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Editar
                    </button>
                    {i.saldoDevedor > 0 && (
                      <button
                        onClick={() => cobrarInstrutor(i.id)}
                        disabled={cobrancaLoading === i.id}
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        {cobrancaLoading === i.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <TrendingDown className="w-3.5 h-3.5" />}
                        Cobrar
                      </button>
                    )}
                    <button
                      onClick={() => toggleBloquear(i.id, i.user.ativo)}
                      disabled={loading === i.id}
                      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        i.user.ativo ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {i.user.ativo ? <><Ban className="w-3.5 h-3.5" /> Bloquear</> : <><CheckCircle className="w-3.5 h-3.5" /> Desbloquear</>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal resultado de cobrança */}
      {cobrancaResult && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-extrabold text-gray-900">Resultado da cobrança</h2>
              <button onClick={() => setCobrancaResult(null)} className="p-2 rounded-xl hover:bg-gray-100">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {cobrancaResult.data.metodo === 'cartao' && cobrancaResult.data.status === 'sucesso' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                <div>
                  <p className="font-bold text-green-800 text-sm">Cobrança realizada com sucesso!</p>
                  <p className="text-xs text-green-700 mt-0.5">R$ {cobrancaResult.data.valor?.toFixed(2)} cobrado no cartão do instrutor.</p>
                </div>
              </div>
            )}

            {cobrancaResult.data.metodo === 'pix' && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                  <p className="font-bold text-amber-800 text-sm mb-1">Cobrança no cartão falhou</p>
                  <p className="text-xs text-amber-700">Solicite ao instrutor que pague via PIX o valor de <strong>R$ {cobrancaResult.data.valor?.toFixed(2)}</strong>.</p>
                </div>
                {cobrancaResult.data.pixChave && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Chave PIX da plataforma</label>
                    <div className="flex items-center gap-2 bg-gray-50 border-2 border-gray-200 rounded-xl px-3 py-2.5">
                      <span className="flex-1 text-xs font-mono text-gray-700 truncate">{cobrancaResult.data.pixChave}</span>
                      <button
                        onClick={() => copiarPix(cobrancaResult.data.pixChave)}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
                      >
                        {pixCopiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {pixCopiado ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {cobrancaResult.data.demo && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <p className="font-bold text-blue-800 text-sm mb-1">Modo demonstração</p>
                <p className="text-xs text-blue-700">{cobrancaResult.data.mensagem}</p>
              </div>
            )}

            <button onClick={() => setCobrancaResult(null)} className="w-full mt-4 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 text-sm transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Editar instrutor</h2>
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
