'use client'

import { useState, useEffect, useRef } from 'react'
import { CheckCircle, Loader2, AlertCircle, Clock, XCircle, ShieldCheck, FileText } from 'lucide-react'

type KYCStatus = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REJEITADO' | null

interface DocUploadProps {
  label: string
  hint: string
  icon: string
  url: string | null
  uploading: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement>
}

function DocUploadCard({ label, hint, icon, url, uploading, onUpload, inputRef }: DocUploadProps) {
  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onChange={onUpload}
        className="hidden"
      />
      {url ? (
        <div className="flex items-center justify-between p-4 rounded-xl border-2 border-green-400 bg-green-50">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">{label}</p>
              <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:underline">
                Ver documento
              </a>
            </div>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="text-xs text-gray-500 border border-gray-300 px-3 py-1.5 rounded-lg hover:border-gray-400"
          >
            Substituir
          </button>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-gray-300 hover:border-green-400 hover:bg-green-50 transition-colors text-left disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="w-8 h-8 text-green-600 animate-spin shrink-0" />
          ) : (
            <span className="text-3xl shrink-0">{icon}</span>
          )}
          <div>
            <p className="text-sm font-semibold text-gray-700">{uploading ? 'Enviando...' : label}</p>
            <p className="text-xs text-gray-400">{hint}</p>
          </div>
        </button>
      )}
    </div>
  )
}

const STATUS_CONFIG = {
  PENDENTE: {
    icon: Clock,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    label: 'Aguardando análise',
    msg: 'Seus documentos foram enviados e estão na fila de análise.',
  },
  EM_ANALISE: {
    icon: ShieldCheck,
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    label: 'Em análise',
    msg: 'Nossa equipe está revisando seus documentos. Você será notificado por e-mail.',
  },
  APROVADO: {
    icon: CheckCircle,
    color: 'text-green-700',
    bg: 'bg-green-50 border-green-200',
    label: 'Documentos aprovados!',
    msg: 'Sua verificação foi concluída. Seu perfil ficará visível após a assinatura estar ativa.',
  },
  REJEITADO: {
    icon: XCircle,
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    label: 'Documentos rejeitados',
    msg: 'Algum documento não foi aceito. Por favor, reenvie os documentos corretos.',
  },
}

export default function InstructorDocumentosPage() {
  const [kycStatus, setKycStatus] = useState<KYCStatus>(null)
  const [observacao, setObservacao] = useState<string | null>(null)
  const [docs, setDocs] = useState({
    docFrenteUrl: null as string | null,
    docVersoUrl: null as string | null,
    comprovanteUrl: null as string | null,
    selfieUrl: null as string | null,
  })
  const [uploading, setUploading] = useState({
    frente: false,
    verso: false,
    comprovante: false,
    selfie: false,
  })
  const [saving, setSaving] = useState(false)
  const [fetching, setFetching] = useState(true)

  const frenteRef = useRef<HTMLInputElement>(null)
  const versoRef = useRef<HTMLInputElement>(null)
  const comprovanteRef = useRef<HTMLInputElement>(null)
  const selfieRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/instrutor/documentos')
      .then(r => r.json())
      .then(data => {
        if (data) {
          setKycStatus(data.status)
          setObservacao(data.observacaoAdmin ?? null)
          setDocs({
            docFrenteUrl: data.docFrenteUrl ?? null,
            docVersoUrl: data.docVersoUrl ?? null,
            comprovanteUrl: data.comprovanteUrl ?? null,
            selfieUrl: data.selfieUrl ?? null,
          })
        }
      })
      .finally(() => setFetching(false))
  }, [])

  async function uploadDoc(key: keyof typeof uploading, field: keyof typeof docs, file: File) {
    setUploading(u => ({ ...u, [key]: true }))
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/instrutor/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) {
      const updatedDocs = { ...docs, [field]: data.url }
      setDocs(updatedDocs)
      // Auto-save to KYC
      setSaving(true)
      await fetch('/api/instrutor/documentos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: data.url }),
      })
      setKycStatus('PENDENTE')
      setSaving(false)
    }
    setUploading(u => ({ ...u, [key]: false }))
  }

  if (fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const statusInfo = kycStatus ? STATUS_CONFIG[kycStatus] : null
  const allDone = docs.docFrenteUrl && docs.docVersoUrl && docs.comprovanteUrl && docs.selfieUrl

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Documentos pessoais
          </h1>
          <p className="text-sm text-gray-500">Verificação necessária para ativar seu perfil</p>
        </div>
      </div>

      {/* Status banner */}
      {statusInfo && (
        <div className={`flex items-start gap-3 p-4 rounded-2xl border mb-5 ${statusInfo.bg}`}>
          <statusInfo.icon className={`w-5 h-5 mt-0.5 shrink-0 ${statusInfo.color}`} />
          <div>
            <p className={`text-sm font-bold ${statusInfo.color}`}>{statusInfo.label}</p>
            <p className={`text-xs mt-0.5 ${statusInfo.color} opacity-80`}>{statusInfo.msg}</p>
            {observacao && kycStatus === 'REJEITADO' && (
              <p className="text-xs mt-2 text-red-800 font-medium">Motivo: {observacao}</p>
            )}
          </div>
        </div>
      )}

      {/* Checklist visual */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Progresso de verificação</p>
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'CNH frente', done: !!docs.docFrenteUrl },
            { label: 'CNH verso', done: !!docs.docVersoUrl },
            { label: 'Comprovante', done: !!docs.comprovanteUrl },
            { label: 'Selfie', done: !!docs.selfieUrl },
          ].map(item => (
            <div key={item.label} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${item.done ? 'bg-green-50' : 'bg-gray-50'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                {item.done
                  ? <svg viewBox="0 0 10 8" className="w-3 h-2.5 fill-white"><path d="M1 4l3 3 5-6"/></svg>
                  : <div className="w-2 h-2 rounded-full bg-gray-400" />
                }
              </div>
              <span className={`text-xs font-medium text-center leading-tight ${item.done ? 'text-green-700' : 'text-gray-400'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CNH */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">CNH — Carteira Nacional de Habilitação</h2>
        <p className="text-xs text-gray-400 mb-4">Envie foto nítida da frente e do verso. Arquivo JPG, PNG ou PDF, máx. 10 MB.</p>
        <div className="space-y-3">
          <DocUploadCard
            label="Frente da CNH"
            hint="Foto da frente com dados visíveis"
            icon="🪪"
            url={docs.docFrenteUrl}
            uploading={uploading.frente}
            onUpload={e => e.target.files?.[0] && uploadDoc('frente', 'docFrenteUrl', e.target.files[0])}
            inputRef={frenteRef}
          />
          <DocUploadCard
            label="Verso da CNH"
            hint="Foto do verso com código de barras"
            icon="🔄"
            url={docs.docVersoUrl}
            uploading={uploading.verso}
            onUpload={e => e.target.files?.[0] && uploadDoc('verso', 'docVersoUrl', e.target.files[0])}
            inputRef={versoRef}
          />
        </div>
      </div>

      {/* Comprovante */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Comprovante de endereço</h2>
        <p className="text-xs text-gray-400 mb-4">Conta de luz, água, banco ou telefone — emitido nos últimos 90 dias.</p>
        <DocUploadCard
          label="Comprovante de endereço"
          hint="Máximo 90 dias de emissão"
          icon="🏠"
          url={docs.comprovanteUrl}
          uploading={uploading.comprovante}
          onUpload={e => e.target.files?.[0] && uploadDoc('comprovante', 'comprovanteUrl', e.target.files[0])}
          inputRef={comprovanteRef}
        />
      </div>

      {/* Selfie */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Selfie com documento</h2>
        <p className="text-xs text-gray-400 mb-4">Segure sua CNH aberta ao lado do rosto. Fundo neutro, boa iluminação.</p>
        <DocUploadCard
          label="Selfie segurando a CNH"
          hint="Rosto e documento visíveis"
          icon="🤳"
          url={docs.selfieUrl}
          uploading={uploading.selfie}
          onUpload={e => e.target.files?.[0] && uploadDoc('selfie', 'selfieUrl', e.target.files[0])}
          inputRef={selfieRef}
        />
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
        <AlertCircle className="w-4 h-4 text-blue-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-blue-800">Como funciona a verificação</p>
          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
            Após enviar todos os documentos, nossa equipe fará a análise em até 24 horas úteis.
            Você receberá um e-mail com o resultado.
            Seu perfil ficará visível para os alunos somente após aprovação e assinatura ativa.
          </p>
        </div>
      </div>

      {saving && (
        <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" />
          Salvando...
        </div>
      )}
    </div>
  )
}
