'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Upload, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const STEPS = [
  { id: 1, label: 'Dados pessoais' },
  { id: 2, label: 'Documentos' },
  { id: 3, label: 'Selfie' },
  { id: 4, label: 'Revisão' },
]

export default function KYCPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [uploaded, setUploaded] = useState<Record<string, boolean>>({})

  // Form data
  const [form, setForm] = useState({
    cpf: '', telefone: '', dataNascimento: '', genero: '',
    cep: '', logradouro: '', numero: '', bairro: '', cidade: '', estado: '',
    // Instrutor fields
    cnhEAR: '', precoPorHora: '', bio: '',
  })

  const isInstrutor = session?.user?.role === 'INSTRUTOR'

  function setField(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function handleFinish() {
    setLoading(true)
    try {
      await fetch('/api/kyc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      router.push('/buscar')
    } catch {
      setLoading(false)
    }
  }

  function fakeUpload(key: string) {
    setUploaded(u => ({ ...u, [key]: true }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Dirige<span className="text-green-600">Já</span>
        </Link>
        <button onClick={() => router.push('/buscar')} className="text-sm text-gray-500 hover:text-gray-700">
          Completar depois
        </button>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                  step > s.id ? 'bg-green-600 text-white' :
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

        {/* Step 1 — Personal data */}
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
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Telefone</label>
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
                <input value={form.cep} onChange={e => setField('cep', e.target.value)} placeholder="00000-000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Cidade</label>
                <input value={form.cidade} onChange={e => setField('cidade', e.target.value)} placeholder="São José dos Campos"
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

            <button onClick={() => setStep(2)} className="w-full mt-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm">
              Continuar →
            </button>
          </div>
        )}

        {/* Step 2 — Documents */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Envie seus documentos</h2>
            <p className="text-sm text-gray-500 mb-6">Fotos nítidas do RG ou CNH. Criptografado com AES-256.</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              {[
                { key: 'frente', label: 'Frente do documento', icon: '🪪' },
                { key: 'verso', label: 'Verso do documento', icon: '🔄' },
              ].map(doc => (
                <button key={doc.key} onClick={() => fakeUpload(doc.key)}
                  className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors ${
                    uploaded[doc.key] ? 'border-green-400 bg-green-50' : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50'
                  }`}
                >
                  {uploaded[doc.key] ? (
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  ) : (
                    <span className="text-3xl">{doc.icon}</span>
                  )}
                  <span className="text-xs font-semibold text-center text-gray-700">{doc.label}</span>
                  <span className="text-xs text-gray-400">{uploaded[doc.key] ? 'Enviado ✓' : 'Clique para enviar'}</span>
                </button>
              ))}
            </div>

            <button onClick={() => fakeUpload('comprovante')}
              className={`w-full flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors mb-4 ${
                uploaded['comprovante'] ? 'border-green-400 bg-green-50' : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
              {uploaded['comprovante'] ? <CheckCircle className="w-8 h-8 text-green-600" /> : <span className="text-3xl">🏠</span>}
              <span className="text-xs font-semibold text-gray-700">Comprovante de endereço</span>
              <span className="text-xs text-gray-400">{uploaded['comprovante'] ? 'Enviado ✓' : 'Conta de luz, água ou banco — últimos 90 dias'}</span>
            </button>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200 mb-5">
              <AlertCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
              <p className="text-xs text-green-800 leading-relaxed">Formatos aceitos: JPG, PNG ou PDF. Tamanho máximo 10 MB por arquivo.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
              <button onClick={() => setStep(3)} className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Selfie */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Selfie de verificação</h2>
            <p className="text-sm text-gray-500 mb-6">Segure seu documento aberto ao lado do rosto com boa iluminação.</p>

            <button onClick={() => fakeUpload('selfie')}
              className={`w-full flex flex-col items-center gap-3 p-10 rounded-2xl border-2 transition-colors mb-5 ${
                uploaded['selfie'] ? 'border-green-400 bg-green-50' : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50'
              }`}
            >
              {uploaded['selfie'] ? (
                <>
                  <CheckCircle className="w-14 h-14 text-green-600" />
                  <span className="text-sm font-semibold text-green-700">Selfie enviada com sucesso!</span>
                </>
              ) : (
                <>
                  <span className="text-5xl">🤳</span>
                  <span className="text-sm font-semibold text-gray-700">Usar câmera</span>
                  <span className="text-xs text-gray-400 text-center max-w-xs">Segure seu documento ao lado do rosto. Fundo neutro e boa iluminação.</span>
                </>
              )}
            </button>

            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200 mb-5">
              <AlertCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
              <p className="text-xs text-green-800 leading-relaxed">A selfie é processada por IA. Nenhum dado biométrico é armazenado permanentemente.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:border-gray-300 transition-colors">
                ← Voltar
              </button>
              <button onClick={() => setStep(4)} className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm">
                Continuar →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div>
            <h2 className="text-xl font-bold mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>Tudo pronto para revisão!</h2>
            <p className="text-sm text-gray-500 mb-6">Confira os dados antes de enviar para análise.</p>

            <div className="bg-gray-50 rounded-2xl p-5 mb-5">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Resumo do cadastro</h3>
              <div className="space-y-2">
                {[
                  { label: 'Nome', val: session?.user?.name },
                  { label: 'E-mail', val: session?.user?.email },
                  { label: 'CPF', val: form.cpf || '—' },
                  { label: 'Cidade', val: form.cidade || '—' },
                  { label: 'Documentos', val: '✓ Enviados', green: true },
                  { label: 'Selfie', val: '✓ Enviada', green: true },
                ].map(row => (
                  <div key={row.label} className="flex justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-medium ${row.green ? 'text-green-600' : 'text-gray-900'}`}>{row.val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 mb-6">
              <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Seus documentos serão analisados em até 24 horas úteis. Você receberá um e-mail com o resultado. Enquanto isso você já pode explorar a plataforma.
              </p>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="w-full py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Enviar e ir para a plataforma
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
