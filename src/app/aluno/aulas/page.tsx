'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import {
  Calendar, Search, ChevronDown, ChevronUp, Phone, ExternalLink, Loader2, XCircle, AlertTriangle,
} from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  AGENDADA: 'Agendada', CONFIRMADA: 'Confirmada', REALIZADA: 'Realizada', CANCELADA: 'Cancelada',
}
const STATUS_COLOR: Record<string, string> = {
  AGENDADA: 'bg-amber-50 text-amber-700',
  CONFIRMADA: 'bg-blue-50 text-blue-700',
  REALIZADA: 'bg-green-50 text-green-700',
  CANCELADA: 'bg-red-50 text-red-700',
}
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function fmtData(iso: string) {
  const d = new Date(iso)
  return {
    dia: d.getDate().toString().padStart(2, '0'),
    mes: MESES[d.getMonth()],
    hora: `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
    full: d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }),
  }
}

function fmtMoeda(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function gerarIniciais(nome: string) {
  const p = nome.trim().split(' ')
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : p[0].slice(0, 2).toUpperCase()
}

export default function MinhasAulasPage() {
  const { status } = useSession()
  const router = useRouter()
  const [aulas, setAulas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [cancelando, setCancelando] = useState<string | null>(null)
  const [cancelErro, setCancelErro] = useState<{ id: string; msg: string; foraPrazo: boolean } | null>(null)
  const [cancelSucesso, setCancelSucesso] = useState<string | null>(null)
  const [confirmarCancel, setConfirmarCancel] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?redirect=/aluno/aulas')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/aluno/aulas')
        .then(r => r.json())
        .then(d => setAulas(Array.isArray(d) ? d : []))
        .finally(() => setLoading(false))
    }
  }, [status])

  async function handleCancelar(aulaId: string) {
    setCancelando(aulaId)
    setCancelErro(null)
    setCancelSucesso(null)
    setConfirmarCancel(null)
    try {
      const res = await fetch('/api/aluno/aulas/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aulaId }),
      })
      const json = await res.json()
      if (!res.ok) {
        setCancelErro({ id: aulaId, msg: json.error, foraPrazo: json.code === 'FORA_DO_PRAZO' })
      } else {
        setCancelSucesso(aulaId)
        setAulas(prev => prev.map(a => a.id === aulaId ? { ...a, status: 'CANCELADA' } : a))
      }
    } catch {
      setCancelErro({ id: aulaId, msg: 'Erro de conexão. Tente novamente.', foraPrazo: false })
    } finally {
      setCancelando(null)
    }
  }

  function podeCancel(aula: any) {
    if (aula.status !== 'AGENDADA' && aula.status !== 'CONFIRMADA') return false
    const horas = (new Date(aula.data).getTime() - Date.now()) / (1000 * 60 * 60)
    return horas >= 48
  }

  function dentroPrazo(aula: any) {
    if (aula.status !== 'AGENDADA' && aula.status !== 'CONFIRMADA') return false
    const horas = (new Date(aula.data).getTime() - Date.now()) / (1000 * 60 * 60)
    return horas > 0 && horas < 48
  }

  if (status === 'loading' || status === 'unauthenticated') return null

  const filtradas = aulas.filter(a => {
    const q = busca.toLowerCase()
    if (q && !a.instrutor.nome?.toLowerCase().includes(q)) return false
    if (filtroStatus && a.status !== filtroStatus) return false
    return true
  })

  const realizadas = aulas.filter(a => a.status === 'REALIZADA').length
  const totalGasto = aulas.filter(a => a.status === 'REALIZADA').reduce((s, a) => s + a.totalPago, 0)
  const proxima = aulas.find(a => a.status === 'AGENDADA' || a.status === 'CONFIRMADA')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10">

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Minhas aulas
          </h1>
          <p className="text-sm text-gray-500 mt-1">Acompanhe todos os seus agendamentos.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total de aulas', val: aulas.length, icon: '📚' },
            { label: 'Aulas realizadas', val: realizadas, icon: '✅' },
            { label: 'Total investido', val: fmtMoeda(totalGasto), icon: '💰' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-extrabold text-gray-900">{s.val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Próxima aula */}
        {proxima && (
          <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 mb-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-600 rounded-2xl flex flex-col items-center justify-center shrink-0">
              <span className="text-white text-lg font-extrabold leading-none">{fmtData(proxima.data).dia}</span>
              <span className="text-green-200 text-xs uppercase">{fmtData(proxima.data).mes}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-0.5">Próxima aula</p>
              <p className="font-bold text-gray-900">com {proxima.instrutor.nome}</p>
              <p className="text-xs text-gray-500">{fmtData(proxima.data).full} · {proxima.duracaoHoras}h</p>
            </div>
            {proxima.instrutor.telefone && (
              <a
                href={`https://wa.me/55${proxima.instrutor.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> WhatsApp
              </a>
            )}
          </div>
        )}

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-xl focus-within:border-green-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Buscar por instrutor..."
              className="text-sm bg-transparent outline-none w-48 placeholder-gray-400"
            />
          </div>
          <div className="flex gap-1.5">
            {[{ val: '', label: 'Todas' }, { val: 'AGENDADA', label: 'Agendadas' }, { val: 'CONFIRMADA', label: 'Confirmadas' }, { val: 'REALIZADA', label: 'Realizadas' }, { val: 'CANCELADA', label: 'Canceladas' }].map(o => (
              <button
                key={o.val}
                onClick={() => setFiltroStatus(o.val)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filtroStatus === o.val ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'}`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
          </div>
        ) : filtradas.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <h3 className="text-base font-bold text-gray-700 mb-2">Nenhuma aula encontrada</h3>
            <p className="text-sm text-gray-400 mb-5">
              {aulas.length === 0 ? 'Você ainda não agendou nenhuma aula.' : 'Tente ajustar os filtros.'}
            </p>
            <Link
              href="/buscar"
              className="inline-block px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm transition-colors"
            >
              Buscar instrutores
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtradas.map(a => {
              const dt = fmtData(a.data)
              const expanded = expandedId === a.id
              return (
                <div key={a.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden transition-all">
                  <button
                    onClick={() => setExpandedId(expanded ? null : a.id)}
                    className="w-full flex items-center gap-4 p-5 text-left hover:bg-gray-50 transition-colors"
                  >
                    {/* Date block */}
                    <div className="w-12 h-14 bg-gray-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                      <span className="text-lg font-extrabold text-gray-900 leading-none">{dt.dia}</span>
                      <span className="text-xs text-gray-500 uppercase">{dt.mes}</span>
                      <span className="text-xs text-gray-400">{dt.hora}</span>
                    </div>

                    {/* Instructor avatar */}
                    <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 flex items-center justify-center text-xs font-bold shrink-0">
                      {a.instrutor.avatarUrl
                        ? <img src={a.instrutor.avatarUrl} className="w-full h-full rounded-full object-cover" alt="" />
                        : gerarIniciais(a.instrutor.nome)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{a.instrutor.nome}</p>
                      <p className="text-xs text-gray-500">{a.duracaoHoras}h · {fmtMoeda(a.totalPago)}</p>
                    </div>

                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[a.status]}`}>
                      {STATUS_LABEL[a.status]}
                    </span>

                    {expanded
                      ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                  </button>

                  {expanded && (
                    <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex-1 min-w-0 space-y-1 text-sm">
                          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Detalhes da aula</p>
                          <p className="text-gray-700">{dt.full}</p>
                          <p className="text-gray-500">Duração: {a.duracaoHoras}h · Valor: {fmtMoeda(a.totalPago)}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {a.instrutor.telefone && (
                            <a
                              href={`https://wa.me/55${a.instrutor.telefone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" /> WhatsApp
                            </a>
                          )}
                          {a.perfilId && (
                            <Link
                              href={`/instrutor/${a.perfilId}`}
                              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-xl hover:border-gray-300 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Ver perfil
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Cancelamento */}
                      {cancelSucesso === a.id && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-medium">
                          <XCircle className="w-4 h-4 shrink-0" /> Aula cancelada. O estorno será processado em até 5 dias úteis.
                        </div>
                      )}
                      {cancelErro !== null && cancelErro.id === a.id && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                          <span>{cancelErro.msg}</span>
                        </div>
                      )}
                      {podeCancel(a) && cancelSucesso !== a.id && (
                        <button
                          onClick={() => setConfirmarCancel(a.id)}
                          className="flex items-center gap-1.5 px-3 py-2 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl hover:bg-red-100 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancelar aula
                        </button>
                      )}
                      {dentroPrazo(a) && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          Cancelamento indisponível — a aula ocorre em menos de 48h e não há estorno.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
