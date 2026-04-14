'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Save, Plus, X, AlertCircle, User, Camera, CheckCircle } from 'lucide-react'

const ESPECIALIDADES_SUGERIDAS = [
  'Primeira habilitação',
  'Reciclagem',
  'Estrada',
  'Carro automático',
  'Carro manual',
  'Ansiedade ao volante',
  'Direção defensiva',
  'Manobras urbanas',
  'Baliza e garagem',
  'Noturna',
]

const MAX_ESPECIALIDADES = 6

export default function InstructorPerfilPage() {
  const [dados, setDados] = useState({
    nome: '',
    email: '',
    precoPorHora: 0,
    mediaAvaliacao: 0,
    totalAvaliacoes: 0,
    visivel: false,
    bio: '',
    especialidades: [] as string[],
    avatarUrl: null as string | null,
  })
  const [novaEsp, setNovaEsp] = useState('')
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const [avatarSaved, setAvatarSaved] = useState(false)
  const avatarRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/instrutor/perfil')
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) setDados(data)
      })
      .finally(() => setFetching(false))
  }, [])

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarError('')
    setAvatarSaved(false)
    setUploadingAvatar(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/instrutor/avatar', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setAvatarError(data.error ?? 'Erro ao enviar a foto')
      } else {
        setDados(d => ({ ...d, avatarUrl: data.avatarUrl }))
        setAvatarSaved(true)
        setTimeout(() => setAvatarSaved(false), 3000)
      }
    } catch {
      setAvatarError('Falha na conexão ao enviar a foto')
    } finally {
      setUploadingAvatar(false)
      if (avatarRef.current) avatarRef.current.value = ''
    }
  }

  function addEsp(esp: string) {
    const val = esp.trim()
    if (!val || dados.especialidades.includes(val) || dados.especialidades.length >= MAX_ESPECIALIDADES) return
    setDados(d => ({ ...d, especialidades: [...d.especialidades, val] }))
    setNovaEsp('')
  }

  function removeEspecialidade(esp: string) {
    setDados(d => ({ ...d, especialidades: d.especialidades.filter(e => e !== esp) }))
  }

  async function handleSave() {
    setSaveError('')
    setSaving(true)
    try {
      const res = await fetch('/api/instrutor/especialidades', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ especialidades: dados.especialidades }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? 'Erro ao salvar')
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setSaveError('Falha na conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const atingiuLimite = dados.especialidades.length >= MAX_ESPECIALIDADES
  const iniciais = dados.nome
    ? dados.nome.split(' ').map(p => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()
    : 'IN'

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Meu perfil público
          </h1>
          <p className="text-sm text-gray-500">Como os alunos te veem na plataforma</p>
        </div>
      </div>

      {/* ── Foto de perfil ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Foto de perfil</h2>
        <p className="text-xs text-gray-400 mb-4">
          Obrigatória — aparece para os alunos ao buscar instrutores. JPG, PNG ou WebP, máx. 5 MB.
        </p>

        <input
          ref={avatarRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />

        <div className="flex items-center gap-5">
          {/* Preview */}
          <div
            className="relative w-20 h-20 rounded-2xl bg-green-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group"
            onClick={() => avatarRef.current?.click()}
          >
            {dados.avatarUrl ? (
              <img src={dados.avatarUrl} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-green-700 text-2xl font-bold">{iniciais}</span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>

          <div className="flex-1">
            {avatarError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs mb-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {avatarError}
              </div>
            )}
            {avatarSaved && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs mb-3">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                Foto atualizada com sucesso!
              </div>
            )}
            {!dados.avatarUrl && !avatarSaved && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs mb-3">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Foto obrigatória para que seu perfil fique visível aos alunos.
              </div>
            )}
            <button
              onClick={() => avatarRef.current?.click()}
              disabled={uploadingAvatar}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {uploadingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
              {uploadingAvatar ? 'Enviando...' : dados.avatarUrl ? 'Trocar foto' : 'Enviar foto'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Info básica (read-only) ────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Informações básicas</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Nome</span>
            <span className="font-medium">{dados.nome}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">E-mail</span>
            <span className="font-medium">{dados.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Preço por hora</span>
            <span className="font-medium text-green-600">R${dados.precoPorHora}/h</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Avaliação média</span>
            <span className="font-medium text-amber-500">★ {dados.mediaAvaliacao} ({dados.totalAvaliacoes} avaliações)</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Perfil visível</span>
            <span className={`font-semibold ${dados.visivel ? 'text-green-600' : 'text-red-500'}`}>
              {dados.visivel ? 'Sim — aparece nas buscas' : 'Não — aguardando aprovação KYC'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Especialidades (editável) ──────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Especialidades</h2>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            atingiuLimite ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-500'
          }`}>
            {dados.especialidades.length}/{MAX_ESPECIALIDADES}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-4">
          Máximo de {MAX_ESPECIALIDADES} especialidades — ficam visíveis no seu perfil para os alunos.
        </p>

        {/* Tags selecionadas */}
        <div className="flex flex-wrap gap-2 mb-4 min-h-[36px]">
          {dados.especialidades.map(e => (
            <span
              key={e}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-800 border border-green-200 font-medium"
            >
              {e}
              <button
                onClick={() => removeEspecialidade(e)}
                className="hover:text-red-600 transition-colors ml-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {dados.especialidades.length === 0 && (
            <span className="text-xs text-gray-400">Nenhuma especialidade adicionada</span>
          )}
        </div>

        {/* Sugestões */}
        {!atingiuLimite && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {ESPECIALIDADES_SUGERIDAS
                .filter(s => !dados.especialidades.includes(s))
                .map(s => (
                  <button
                    key={s}
                    onClick={() => addEsp(s)}
                    className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border-2 border-dashed border-gray-300 text-gray-600 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-colors font-medium"
                  >
                    <Plus className="w-3 h-3" />
                    {s}
                  </button>
                ))
              }
            </div>
          </div>
        )}

        {/* Campo livre */}
        <div className="flex gap-2">
          <input
            value={novaEsp}
            onChange={e => setNovaEsp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEsp(novaEsp)}
            placeholder="Adicionar especialidade personalizada..."
            disabled={atingiuLimite}
            className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => addEsp(novaEsp)}
            disabled={atingiuLimite || !novaEsp.trim()}
            className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm font-semibold disabled:opacity-40"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {atingiuLimite && (
          <p className="text-xs text-amber-700 mt-2 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Limite de {MAX_ESPECIALIDADES} especialidades atingido. Remova uma para adicionar outra.
          </p>
        )}

        {saved && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
            ✓ Especialidades salvas!
          </div>
        )}
        {saveError && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-4 w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar especialidades
        </button>
      </div>
    </div>
  )
}
