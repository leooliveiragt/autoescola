'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { Upload, CheckCircle, Clock, XCircle, AlertCircle, Loader2, ShieldCheck } from 'lucide-react'

export default function AlunoKYCPage() {
  const router = useRouter()
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const docFrenteRef = useRef<HTMLInputElement>(null)
  const docVersoRef  = useRef<HTMLInputElement>(null)
  const selfieRef    = useRef<HTMLInputElement>(null)
  const [docFrente, setDocFrente] = useState<File | null>(null)
  const [docVerso,  setDocVerso]  = useState<File | null>(null)
  const [selfie,    setSelfie]    = useState<File | null>(null)

  useEffect(() => {
    fetch('/api/aluno/kyc')
      .then(r => r.json())
      .then(d => setStatus(d.status ?? null))
      .finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!docFrente || !docVerso || !selfie) {
      setError('Envie todos os documentos obrigatórios.')
      return
    }
    setSubmitting(true)
    setError('')
    const fd = new FormData()
    fd.append('docFrente', docFrente)
    fd.append('docVerso', docVerso)
    fd.append('selfie', selfie)
    const res = await fetch('/api/aluno/kyc', { method: 'POST', body: fd })
    setSubmitting(false)
    if (res.ok) {
      setSuccess(true)
      setStatus('PENDENTE')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao enviar documentos.')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-12">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Verificação de identidade
          </h1>
          <p className="text-sm text-gray-500">
            Para sua segurança e a dos instrutores, precisamos verificar sua identidade antes de agendar aulas.
          </p>
        </div>

        {/* Status: approved */}
        {status === 'APROVADO' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-green-800 mb-1">Identidade verificada!</h2>
            <p className="text-sm text-green-700 mb-4">Sua conta está aprovada. Você pode agendar aulas normalmente.</p>
            <button onClick={() => router.push('/buscar')} className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm transition-colors">
              Buscar instrutores
            </button>
          </div>
        )}

        {/* Status: pending */}
        {(status === 'PENDENTE' || status === 'EM_ANALISE') && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <Clock className="w-10 h-10 text-amber-500 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-amber-800 mb-1">Documentos em análise</h2>
            <p className="text-sm text-amber-700">Seus documentos foram enviados e estão sendo analisados. Você será notificado em breve (geralmente em até 24h).</p>
          </div>
        )}

        {/* Status: rejected */}
        {status === 'REJEITADO' && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm font-bold text-red-700">Documentos rejeitados</p>
            </div>
            <p className="text-xs text-red-600">Envie novamente com documentos legíveis e uma selfie clara.</p>
          </div>
        )}

        {/* Upload form */}
        {(status === null || status === 'REJEITADO') && !success && (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
            <h2 className="text-sm font-bold text-gray-700 mb-1">Envie seus documentos</h2>
            <p className="text-xs text-gray-400">Formatos aceitos: JPG, PNG, PDF. Máx. 10MB cada.</p>

            {[
              { label: 'Documento de identidade (frente)', ref: docFrenteRef, file: docFrente, set: setDocFrente },
              { label: 'Documento de identidade (verso)', ref: docVersoRef, file: docVerso, set: setDocVerso },
              { label: 'Selfie segurando o documento', ref: selfieRef, file: selfie, set: setSelfie },
            ].map(({ label, ref, file, set }) => (
              <div key={label}>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">{label}</label>
                <input ref={ref} type="file" accept="image/*,.pdf" className="hidden" onChange={e => set(e.target.files?.[0] ?? null)} />
                <button
                  type="button"
                  onClick={() => ref.current?.click()}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-sm transition-colors ${file ? 'border-green-400 bg-green-50 text-green-700' : 'border-dashed border-gray-300 text-gray-500 hover:border-green-400 hover:bg-green-50'}`}
                >
                  {file ? <CheckCircle className="w-4 h-4 shrink-0" /> : <Upload className="w-4 h-4 shrink-0 text-gray-400" />}
                  {file ? file.name : 'Clique para selecionar arquivo'}
                </button>
              </div>
            ))}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit" disabled={submitting}
              className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</> : <><ShieldCheck className="w-4 h-4" /> Enviar para verificação</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
