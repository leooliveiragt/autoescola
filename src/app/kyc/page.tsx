'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react'
import Link from 'next/link'

async function fetchCEP(cep: string) {
  const clean = cep.replace(/\D/g, '')
  if (clean.length !== 8) return null
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

const STEPS = [
  { id: 1, label: 'Dados pessoais' },
  { id: 2, label: 'Documentos' },
  { id: 3, label: 'Selfie' },
  { id: 4, label: 'Revisão' },
]

function FileInput({
  label,
  sublabel,
  emoji,
  file,
  onFile,
  accept = 'image/*,.pdf',
}: {
  label: string
  sublabel?: string
  emoji: string
  file: File | null
  onFile: (f: File) => void
  accept?: string
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input
        ref={ref}
        type="file"
        accept={accept}
        className="hidden"
        onChange={e => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={`w-full flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors ${
          file
            ? 'border-green-400 bg-green-50'
            : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
      >
        {file ? (
          <>
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-xs font-semibold text-green-700 text-center">{label}</span>
            <span className="text-xs text-green-600 text-center truncate max-w-full px-2">{file.name}</span>
          </>
        ) : (
          <>
            <span className="text-3xl">{emoji}</span>
            <span className="text-xs font-semibold text-gray-700 text-center">{label}</span>
            {sublabel && <span className="text-xs text-gray-400 text-center">{sublabel}</span>}
            <span className="text-xs text-green-600 font-medium">Clique para selecionar</span>
          </>
        )}
      </button>
    </div>
  )
}

export default function KYCPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Personal data
  const [form, setForm] = useState({
    cpf: '', telefone: '', dataNascimento: '', genero: '',
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '',
    cnhEAR: '', precoPorHora: '', bio: '',
  })

  // Files
  const [docFrente,   setDocFrente]   = useState<File | null>(null)
  const [docVerso,    setDocVerso]    = useState<File | null>(null)
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [selfie,      setSelfie]      = useState<File | null>(null)

  const [cepLoading, setCepLoading] = useState(false)
  const isInstrutor = session?.user?.role === 'INSTRUTOR'

  function setField(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleCepBlur() {
    const clean = form.cep.replace(/\D/g, '')
    if (clean.length !== 8) return
    setCepLoading(true)
    const data = await fetchCEP(clean)
    setCepLoading(false)
    if (!data) return
    setForm(f => ({
      ...f,
      logradouro: data.street || f.logradouro,
      bairro: data.neighborhood || f.bairro,
      cidade: data.city || f.cidade,
      estado: data.state || f.estado,
    }))
  }

  function canAdvanceStep2() {
    return docFrente !== null && docVerso !== null
  }

  function canAdvanceStep3() {
    return selfie !== null
  }

  async function handleFinish() {
    if (!selfie || !docFrente || !docVerso) {
      setError('Envie todos os documentos obrigatórios antes de continuar.')
      return
    }
    setLoading(true)
    setError('')

    try {
      // 1. Save personal data
      const dataRes = await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!dataRes.ok) {
        const d = await dataRes.json()
        setError(d.error ?? 'Erro ao salvar dados pessoais.')
        setLoading(false)
        return
      }

      // 2. Upload documents
      const fd = new FormData()
      fd.append('docFrente', docFrente)
      fd.append('docVerso', docVerso)
      fd.append('selfie', selfie)
      if (comprovante) fd.append('comprovante', comprovante)

      const uploadRes = await fetch('/api/aluno/kyc', { method: 'POST', body: fd })
      if (!uploadRes.ok) {
        const d = await uploadRes.json()
        setError(d.error ?? 'Erro ao enviar documentos.')
        setLoading(false)
        return
      }

      // 3. Sign out and redirect to pending screen
      await signOut({ redirect: false })
      router.push('/cadastro-pendente')
    } catch {
      setError('Erro inesperado. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Dirige<span className="text-green-600">Já</span>
        </Link>
        <p className="text-xs text-gray-400">Verificação de identidade obrigatória</p>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  step > s.id  ? 'bg-green-600 text-white' :
                  step === s.id ? 'bg-green-100 border-2 border-green-500 text-green-700' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.id ? '✓' : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 ${step > s.id ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {STEPS.map(s => (
              <span key={s.id} className={`text-xs ${step === s.id ? 'text-green-600 font-semibold' : 'text-gray-400'}`}>
                {s.label}
              </span>
            ))}
          </div>
          <div className="mt-3 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
        </div>

        {/* ── Step 1 — Personal data ─────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Seus dados pessoais</h2>
            <p className="text-sm text-gray-500 mb-6">Precisamos dessas informações para criar seu perfil verificado.</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">CPF</label>
                <input value={form.cpf} onChange={e => setField('cpf', e.target.value)} placeholder="000.000.000-00"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Telefone / WhatsApp *</label>
                <input value={form.telefone} onChange={e => setField('telefone', e.target.value)} placeholder="(11) 99999-9999"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Nascimento</label>
                <input type="date" value={form.dataNascimento} onChange={e => setField('dataNascimento', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Gênero</label>
                <select value={form.genero} onChange={e => setField('genero', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm">
                  <option value="">Selecione</option>
                  <option value="F">Feminino</option>
                  <option value="M">Masculino</option>
                  <option value="NB">Não-binário</option>
                  <option value="ND">Prefiro não dizer</option>
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 my-5" />
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Endereço</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">CEP</label>
                <div className="relative">
                  <input value={form.cep} onChange={e => setField('cep', e.target.value)} onBlur={handleCepBlur}
                    placeholder="00000-000" maxLength={9}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                  {cepLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Cidade</label>
                <input value={form.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="São Paulo"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Logradouro</label>
                <input value={form.logradouro} onChange={e => setField('logradouro', e.target.value)} placeholder="Rua das Flores"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Número</label>
                <input value={form.numero} onChange={e => setField('numero', e.target.value)} placeholder="123"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Bairro</label>
                <input value={form.bairro} onChange={e => setField('bairro', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Estado</label>
                <input value={form.estado} onChange={e => setField('estado', e.target.value)} placeholder="SP" maxLength={2}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
            </div>

            {isInstrutor && (
              <>
                <div className="border-t border-gray-200 my-5" />
                <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Dados profissionais</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">CNH EAR nº</label>
                    <input value={form.cnhEAR} onChange={e => setField('cnhEAR', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Preço/hora (R$)</label>
                    <input type="number" value={form.precoPorHora} onChange={e => setField('precoPorHora', e.target.value)} placeholder="120"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Sobre você</label>
                  <textarea value={form.bio} onChange={e => setField('bio', e.target.value)}
                    placeholder="Descreva sua experiência, método de ensino e especialidades..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none" />
                </div>
              </>
            )}

            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mt-4">
              * O número de WhatsApp é obrigatório — você será notificado por lá sobre o resultado da análise.
            </p>

            <button
              onClick={() => { if (!form.telefone.trim()) { setError('Informe seu WhatsApp antes de continuar.'); return; } setError(''); setStep(2) }}
              className="w-full mt-5 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
            >
              Continuar →
            </button>
            {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
          </div>
        )}

        {/* ── Step 2 — Documents ────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Envie seus documentos</h2>
            <p className="text-sm text-gray-500 mb-6">Fotos nítidas do RG ou CNH. Criptografado com AES-256.</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <FileInput label="Frente do documento *" emoji="🪪" file={docFrente} onFile={setDocFrente} />
              <FileInput label="Verso do documento *" emoji="🔄" file={docVerso} onFile={setDocVerso} />
            </div>

            <div className="mb-4">
              <FileInput
                label="Comprovante de endereço"
                sublabel="Conta de luz, água ou banco — últimos 90 dias (opcional)"
                emoji="🏠"
                file={comprovante}
                onFile={setComprovante}
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200 mb-5">
              <AlertCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
              <p className="text-xs text-green-800 leading-relaxed">Formatos aceitos: JPG, PNG ou PDF. Tamanho máximo 10 MB por arquivo.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
              <button
                onClick={() => { if (!canAdvanceStep2()) { setError('Envie frente e verso do documento.'); return; } setError(''); setStep(3) }}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Continuar →
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
          </div>
        )}

        {/* ── Step 3 — Selfie ───────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Selfie de verificação *</h2>
            <p className="text-sm text-gray-500 mb-6">Segure seu documento aberto ao lado do rosto com boa iluminação.</p>

            <div className="mb-5">
              <FileInput
                label="Selfie com documento"
                sublabel="Fundo neutro, boa iluminação, documento legível"
                emoji="🤳"
                file={selfie}
                onFile={setSelfie}
                accept="image/*"
              />
            </div>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200 mb-5">
              <AlertCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
              <p className="text-xs text-green-800 leading-relaxed">A selfie é usada apenas para verificação. Nenhum dado biométrico é armazenado permanentemente.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
              <button
                onClick={() => { if (!canAdvanceStep3()) { setError('Envie a selfie com documento antes de continuar.'); return; } setError(''); setStep(4) }}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm"
              >
                Continuar →
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-3 text-center">{error}</p>}
          </div>
        )}

        {/* ── Step 4 — Review ───────────────────────────────────── */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Tudo pronto para revisão!</h2>
            <p className="text-sm text-gray-500 mb-6">Confira antes de enviar. Após o envio, aguarde a análise.</p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-5 space-y-2">
              {[
                { label: 'Nome', val: session?.user?.name },
                { label: 'E-mail', val: session?.user?.email },
                { label: 'CPF', val: form.cpf || '—' },
                { label: 'WhatsApp', val: form.telefone || '—' },
                { label: 'Cidade', val: form.cidade || '—' },
                { label: 'Frente do doc', val: docFrente?.name ?? '—', green: !!docFrente },
                { label: 'Verso do doc', val: docVerso?.name ?? '—', green: !!docVerso },
                { label: 'Selfie', val: selfie?.name ?? '—', green: !!selfie },
                { label: 'Comprovante', val: comprovante?.name ?? 'Não enviado (opcional)', green: !!comprovante },
              ].map(row => (
                <div key={row.label} className="flex justify-between text-sm">
                  <span className="text-gray-500">{row.label}</span>
                  <span className={`font-medium text-right max-w-xs truncate ${row.green ? 'text-green-600' : 'text-gray-900'}`}>{row.val}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
              <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Seus documentos serão analisados em até 24 horas úteis. Você receberá uma mensagem no WhatsApp com o resultado. Enquanto isso, sua conta ficará aguardando aprovação.
              </p>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
                <X className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Enviando...' : 'Enviar documentos'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
