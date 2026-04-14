'use client'

import { useState, useEffect, useRef } from 'react'
import { Loader2, Save, Car, FileText, AlertCircle, CheckCircle, Pencil, Trash2, PowerOff, Power, Plus } from 'lucide-react'

const OPCIONAIS_LISTA = [
  'Ar condicionado',
  'Câmera de ré',
  'Sensor de estacionamento',
  'Direção elétrica',
  'Direção hidráulica',
  'Freios ABS',
  'Airbag',
  'Computador de bordo',
  'Bluetooth / central multimídia',
  'Vidros elétricos',
  'Travas elétricas',
  'Banco regulável',
]

const ANOS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

const CAMBIO_LABEL: Record<string, string> = {
  manual: 'Manual',
  automatico: 'Automático',
  cvt: 'CVT',
  'semi-automatico': 'Semi-automático',
}

type VehicleData = {
  id: string
  placa: string
  marca: string
  modelo: string
  ano: number
  cor: string
  cambio: string
  opcionais: string[]
  crlvUrl: string | null
  ativo: boolean
}

type Mode = 'loading' | 'view' | 'edit' | 'empty'

const EMPTY_FORM = {
  placa: '',
  marca: '',
  modelo: '',
  ano: String(new Date().getFullYear()),
  cor: '',
  cambio: 'manual',
  opcionais: [] as string[],
  crlvUrl: '',
}

export default function InstructorVeiculoPage() {
  const [veiculo, setVeiculo] = useState<VehicleData | null>(null)
  const [mode, setMode] = useState<Mode>('loading')
  const [form, setForm] = useState(EMPTY_FORM)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saved, setSaved] = useState(false)

  const [toggling, setToggling] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState('')

  const [uploadingCrlv, setUploadingCrlv] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const crlvRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/instrutor/veiculo')
      .then(r => r.json())
      .then((data: VehicleData | null) => {
        if (data && !('error' in (data as object))) {
          setVeiculo(data)
          setForm({
            placa: data.placa ?? '',
            marca: data.marca ?? '',
            modelo: data.modelo ?? '',
            ano: String(data.ano ?? new Date().getFullYear()),
            cor: data.cor ?? '',
            cambio: data.cambio ?? 'manual',
            opcionais: data.opcionais ?? [],
            crlvUrl: data.crlvUrl ?? '',
          })
          setMode('view')
        } else {
          setMode('empty')
        }
      })
      .catch(() => setMode('empty'))
  }, [])

  function toggleOpcional(op: string) {
    setForm(f => ({
      ...f,
      opcionais: f.opcionais.includes(op)
        ? f.opcionais.filter(o => o !== op)
        : [...f.opcionais, op],
    }))
  }

  async function handleCrlvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploadingCrlv(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/instrutor/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) {
        setUploadError(data.error ?? 'Erro ao enviar o arquivo')
      } else if (data.url) {
        setForm(f => ({ ...f, crlvUrl: data.url }))
      }
    } catch {
      setUploadError('Falha na conexão ao enviar o arquivo')
    } finally {
      setUploadingCrlv(false)
      if (crlvRef.current) crlvRef.current.value = ''
    }
  }

  async function handleSave() {
    setSaveError('')
    setSaving(true)
    try {
      const res = await fetch('/api/instrutor/veiculo', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, ano: Number(form.ano) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setSaveError(data.error ?? 'Erro ao salvar')
      } else {
        setVeiculo(data)
        setMode('view')
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch {
      setSaveError('Falha na conexão. Tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  async function handleToggleAtivo() {
    if (!veiculo) return
    setActionError('')
    setToggling(true)
    try {
      const res = await fetch('/api/instrutor/veiculo', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ativo: !veiculo.ativo }),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? 'Erro ao atualizar status')
      } else {
        setVeiculo(data)
      }
    } catch {
      setActionError('Falha na conexão. Tente novamente.')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setActionError('')
    setDeleting(true)
    try {
      const res = await fetch('/api/instrutor/veiculo', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        setActionError(data.error ?? 'Erro ao excluir')
      } else {
        setVeiculo(null)
        setForm(EMPTY_FORM)
        setConfirmDelete(false)
        setMode('empty')
      }
    } catch {
      setActionError('Falha na conexão. Tente novamente.')
    } finally {
      setDeleting(false)
    }
  }

  function startEdit() {
    if (veiculo) {
      setForm({
        placa: veiculo.placa ?? '',
        marca: veiculo.marca ?? '',
        modelo: veiculo.modelo ?? '',
        ano: String(veiculo.ano ?? new Date().getFullYear()),
        cor: veiculo.cor ?? '',
        cambio: veiculo.cambio ?? 'manual',
        opcionais: veiculo.opcionais ?? [],
        crlvUrl: veiculo.crlvUrl ?? '',
      })
    }
    setSaveError('')
    setUploadError('')
    setMode('edit')
  }

  function cancelEdit() {
    setSaveError('')
    setMode('view')
  }

  if (mode === 'loading') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
          <Car className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Dados do veículo
          </h1>
          <p className="text-sm text-gray-500">Informações do carro usado nas aulas</p>
        </div>
      </div>

      {/* ── VIEW MODE ─────────────────────────────────────────────────────── */}
      {mode === 'view' && veiculo && (
        <>
          {/* Success toast */}
          {saved && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
              ✓ Dados do veículo atualizados com sucesso!
            </div>
          )}

          {/* Vehicle card */}
          <div className={`bg-white rounded-2xl border-2 p-6 mb-4 ${veiculo.ativo ? 'border-gray-100' : 'border-dashed border-gray-300 opacity-70'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${veiculo.ativo ? 'bg-blue-50' : 'bg-gray-100'}`}>
                  <Car className={`w-5 h-5 ${veiculo.ativo ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900">
                    {veiculo.marca} {veiculo.modelo}
                  </p>
                  <p className="text-xs text-gray-500">{veiculo.ano} · {veiculo.cor} · {CAMBIO_LABEL[veiculo.cambio] ?? veiculo.cambio}</p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${veiculo.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {veiculo.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>

            {/* Placa */}
            <div className="mb-4">
              <span className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-mono font-bold px-4 py-1.5 rounded-lg tracking-widest">
                {veiculo.placa || '———'}
              </span>
            </div>

            {/* Opcionais */}
            {veiculo.opcionais?.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Opcionais</p>
                <div className="flex flex-wrap gap-1.5">
                  {veiculo.opcionais.map(op => (
                    <span key={op} className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                      {op}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CRLV */}
            <div className="flex items-center gap-2 text-xs">
              {veiculo.crlvUrl ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <a href={veiculo.crlvUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-medium">
                    CRLV enviado — ver documento
                  </a>
                </>
              ) : (
                <>
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-600 font-medium">CRLV não enviado</span>
                </>
              )}
            </div>
          </div>

          {/* Action error */}
          {actionError && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {actionError}
            </div>
          )}

          {/* Delete confirmation */}
          {confirmDelete ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-4">
              <p className="text-sm font-semibold text-red-800 mb-1">Tem certeza que deseja excluir o veículo?</p>
              <p className="text-xs text-red-600 mb-4">Esta ação não pode ser desfeita.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Sim, excluir
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={startEdit}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Editar dados
              </button>
              <button
                onClick={handleToggleAtivo}
                disabled={toggling}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors disabled:opacity-60 ${
                  veiculo.ativo
                    ? 'bg-white border-amber-300 text-amber-700 hover:bg-amber-50'
                    : 'bg-white border-green-300 text-green-700 hover:bg-green-50'
                }`}
              >
                {toggling
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : veiculo.ativo
                    ? <PowerOff className="w-4 h-4" />
                    : <Power className="w-4 h-4" />
                }
                {veiculo.ativo ? 'Inativar' : 'Reativar'}
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </button>
            </div>
          )}
        </>
      )}

      {/* ── FORM (edit or empty) ──────────────────────────────────────────── */}
      {(mode === 'edit' || mode === 'empty') && (
        <>
          {mode === 'empty' && (
            <div className="flex items-center gap-2 p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-sm mb-5">
              <Plus className="w-4 h-4 shrink-0" />
              Nenhum veículo cadastrado ainda. Preencha os dados abaixo.
            </div>
          )}

          {/* Dados básicos */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Identificação</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Placa</label>
                <input
                  value={form.placa}
                  onChange={e => setForm(f => ({ ...f, placa: e.target.value.toUpperCase() }))}
                  placeholder="ABC-1234"
                  maxLength={8}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm font-mono tracking-widest"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Ano</label>
                <select
                  value={form.ano}
                  onChange={e => setForm(f => ({ ...f, ano: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                >
                  {ANOS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Marca</label>
                <input
                  value={form.marca}
                  onChange={e => setForm(f => ({ ...f, marca: e.target.value }))}
                  placeholder="Volkswagen, Fiat, Chevrolet..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Modelo</label>
                <input
                  value={form.modelo}
                  onChange={e => setForm(f => ({ ...f, modelo: e.target.value }))}
                  placeholder="Gol, Polo, Onix..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Cor</label>
                <input
                  value={form.cor}
                  onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                  placeholder="Prata, Branco, Preto..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Câmbio</label>
                <select
                  value={form.cambio}
                  onChange={e => setForm(f => ({ ...f, cambio: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                >
                  <option value="manual">Manual</option>
                  <option value="automatico">Automático</option>
                  <option value="cvt">CVT</option>
                  <option value="semi-automatico">Semi-automático</option>
                </select>
              </div>
            </div>
          </div>

          {/* Opcionais */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Opcionais do veículo</h2>
            <p className="text-xs text-gray-400 mb-4">Marque os recursos disponíveis — o aluno verá essas informações</p>
            <div className="grid grid-cols-2 gap-2.5">
              {OPCIONAIS_LISTA.map(op => {
                const checked = form.opcionais.includes(op)
                return (
                  <button
                    key={op}
                    type="button"
                    onClick={() => toggleOpcional(op)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 text-left transition-all text-xs font-medium ${
                      checked
                        ? 'border-green-400 bg-green-50 text-green-800'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      checked ? 'bg-green-500 border-green-500' : 'border-gray-300'
                    }`}>
                      {checked && <svg viewBox="0 0 10 8" className="w-2.5 h-2 fill-white"><path d="M1 4l3 3 5-6"/></svg>}
                    </div>
                    {op}
                  </button>
                )
              })}
            </div>
          </div>

          {/* CRLV */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CRLV — Documento do veículo</h2>
            <p className="text-xs text-gray-400 mb-4">Certificado de Registro e Licenciamento de Veículo. JPG, PNG ou PDF, máx. 10 MB.</p>

            <input
              ref={crlvRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleCrlvUpload}
              className="hidden"
            />

            {uploadError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {uploadError}
              </div>
            )}

            {form.crlvUrl ? (
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-green-400 bg-green-50">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-green-800">CRLV enviado</p>
                    <a href={form.crlvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                      Ver documento
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => crlvRef.current?.click()}
                  className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-3 py-1.5 rounded-lg"
                >
                  Substituir
                </button>
              </div>
            ) : (
              <button
                onClick={() => crlvRef.current?.click()}
                disabled={uploadingCrlv}
                className="w-full flex flex-col items-center gap-2 py-8 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors disabled:opacity-60"
              >
                {uploadingCrlv
                  ? <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
                  : <FileText className="w-8 h-8 text-gray-400" />
                }
                <span className="text-sm font-semibold text-gray-600">
                  {uploadingCrlv ? 'Enviando...' : 'Clique para enviar o CRLV'}
                </span>
                <span className="text-xs text-gray-400">JPG, PNG ou PDF</span>
              </button>
            )}
          </div>

          {saveError && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {saveError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {mode === 'edit' ? 'Salvar alterações' : 'Cadastrar veículo'}
            </button>
            {mode === 'edit' && (
              <button
                onClick={cancelEdit}
                className="px-5 py-3.5 bg-white border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
