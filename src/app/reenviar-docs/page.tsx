'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, AlertCircle, Loader2, AlertTriangle, X } from 'lucide-react'

function FileBtn({
  label, sublabel, emoji, file, onFile, accept = 'image/*,.pdf',
}: { label: string; sublabel?: string; emoji: string; file: File | null; onFile: (f: File) => void; accept?: string }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input ref={ref} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f) }} />
      <button type="button" onClick={() => ref.current?.click()}
        className={`w-full flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors ${
          file ? 'border-green-400 bg-green-50' : 'border-dashed border-gray-300 hover:border-green-400 hover:bg-gray-50'
        }`}
      >
        {file ? (
          <>
            <CheckCircle className="w-7 h-7 text-green-600" />
            <span className="text-xs font-semibold text-green-700 text-center">{label}</span>
            <span className="text-xs text-green-600 truncate max-w-full px-2">{file.name}</span>
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

function ReenviarContent() {
  const params = useSearchParams()
  const userId = params.get('u') ?? ''

  const [info, setInfo]       = useState<{ nome: string; motivo: string } | null>(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [invalid, setInvalid] = useState(false)

  const [docFrente,   setDocFrente]   = useState<File | null>(null)
  const [docVerso,    setDocVerso]    = useState<File | null>(null)
  const [comprovante, setComprovante] = useState<File | null>(null)
  const [selfie,      setSelfie]      = useState<File | null>(null)

  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [sucesso,  setSucesso]  = useState(false)

  useEffect(() => {
    if (!userId) { setInvalid(true); setLoadingInfo(false); return }
    fetch(`/api/reenviar-docs?u=${userId}`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(d => setInfo(d))
      .catch(() => setInvalid(true))
      .finally(() => setLoadingInfo(false))
  }, [userId])

  async function handleEnviar() {
    if (!docFrente || !docVerso || !selfie) {
      setError('Frente, verso e selfie são obrigatórios.')
      return
    }
    setLoading(true)
    setError('')
    const fd = new FormData()
    fd.append('userId', userId)
    fd.append('docFrente', docFrente)
    fd.append('docVerso', docVerso)
    fd.append('selfie', selfie)
    if (comprovante) fd.append('comprovante', comprovante)

    const res = await fetch('/api/reenviar-docs', { method: 'POST', body: fd })
    setLoading(false)
    if (res.ok) {
      setSucesso(true)
    } else {
      const d = await res.json()
      setError(d.error ?? 'Erro ao enviar. Tente novamente.')
    }
  }

  if (loadingInfo) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (invalid) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center max-w-md w-full">
        <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Link inválido ou expirado</h2>
        <p className="text-sm text-gray-500 mb-5">Este link de reenvio não é válido. Use o link que foi enviado para o seu WhatsApp.</p>
        <Link href="/" className="text-green-600 text-sm font-semibold hover:underline">Voltar ao início</Link>
      </div>
    )
  }

  if (sucesso) {
    return (
      <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center max-w-md w-full">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">Documentos reenviados!</h2>
        <p className="text-sm text-gray-600 mb-5">
          Seus novos documentos foram enviados e estão em análise. Você receberá uma mensagem no WhatsApp assim que houver resposta.
        </p>
        <Link href="/" className="text-green-600 text-sm font-semibold hover:underline">Voltar ao início</Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 w-full max-w-md">
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl mb-6">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-bold text-red-800 mb-1">Cadastro reprovado</p>
          <p className="text-xs text-red-700 leading-relaxed">
            <strong>Motivo:</strong> {info?.motivo}
          </p>
        </div>
      </div>

      <h2 className="text-lg font-extrabold text-gray-900 mb-1">
        Olá, {info?.nome?.split(' ')[0]}! Reenvie seus documentos
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Corrija o problema indicado acima e envie os documentos novamente.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <FileBtn label="Frente do documento *" emoji="🪪" file={docFrente} onFile={setDocFrente} />
        <FileBtn label="Verso do documento *" emoji="🔄" file={docVerso}  onFile={setDocVerso} />
      </div>
      <div className="mb-3">
        <FileBtn label="Comprovante de endereço" sublabel="Opcional" emoji="🏠" file={comprovante} onFile={setComprovante} />
      </div>
      <div className="mb-5">
        <FileBtn label="Selfie com documento *" sublabel="Segure o doc ao lado do rosto" emoji="🤳" file={selfie} onFile={setSelfie} accept="image/*" />
      </div>

      <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-200 mb-5">
        <AlertCircle className="w-4 h-4 text-green-700 mt-0.5 shrink-0" />
        <p className="text-xs text-green-800">Formatos aceitos: JPG, PNG, PDF. Máx. 10 MB por arquivo.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-4">
          <X className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      <button
        onClick={handleEnviar}
        disabled={loading}
        className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? 'Enviando...' : 'Enviar documentos para análise'}
      </button>
    </div>
  )
}

export default function ReenviarDocsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="fixed top-0 left-0 right-0 flex gap-3 h-1.5 z-50">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-100'}`} />
        ))}
      </div>

      <Link href="/" className="text-xl font-extrabold tracking-tight mb-8" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        Dirige<span className="text-green-600">Já</span>
      </Link>

      <Suspense fallback={<div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />}>
        <ReenviarContent />
      </Suspense>
    </div>
  )
}
