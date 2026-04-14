'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { MessageSquare, Plus, Send, X, ChevronRight, Clock, CheckCircle } from 'lucide-react'

const STATUS_LABEL: Record<string, string> = {
  ABERTO: 'Aberto', EM_ATENDIMENTO: 'Em atendimento', RESOLVIDO: 'Resolvido', FECHADO: 'Fechado',
}
const STATUS_COLOR: Record<string, string> = {
  ABERTO: 'bg-amber-50 text-amber-700',
  EM_ATENDIMENTO: 'bg-blue-50 text-blue-700',
  RESOLVIDO: 'bg-green-50 text-green-700',
  FECHADO: 'bg-gray-100 text-gray-500',
}

export default function SuportePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any>(null)
  const [showNew, setShowNew] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [resposta, setResposta] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/tickets').then(r => r.json()).then(d => { if (Array.isArray(d)) setTickets(d) }).finally(() => setLoading(false))
    }
  }, [status])

  async function handleNovoTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!titulo.trim() || !mensagem.trim()) return
    setSending(true)
    const res = await fetch('/api/tickets', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ titulo, mensagem }),
    })
    const data = await res.json()
    setSending(false)
    if (res.ok) { setTickets(t => [data, ...t]); setShowNew(false); setTitulo(''); setMensagem('') }
  }

  async function handleResponder() {
    if (!resposta.trim() || !selected) return
    setSending(true)
    await fetch(`/api/tickets/${selected.id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagem: resposta }),
    })
    setSending(false)
    const novaMsg = { id: Date.now(), mensagem: resposta, isAdmin: false, autor: { nome: session?.user?.name ?? 'Você', role: session?.user?.role }, createdAt: new Date() }
    setSelected((p: any) => ({ ...p, mensagens: [...p.mensagens, novaMsg] }))
    setResposta('')
  }

  if (status === 'loading' || loading) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>Suporte</h1>
            <p className="text-sm text-gray-500">Abra um ticket e nossa equipe responderá em breve.</p>
          </div>
          <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm transition-colors">
            <Plus className="w-4 h-4" /> Novo ticket
          </button>
        </div>

        {tickets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum ticket aberto ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => (
              <button key={t.id} onClick={() => setSelected(t)} className="w-full bg-white rounded-2xl border border-gray-100 p-5 hover:border-green-300 transition-all text-left flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${t.status === 'ABERTO' ? 'bg-amber-400' : t.status === 'EM_ATENDIMENTO' ? 'bg-blue-400' : 'bg-green-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{t.titulo}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.mensagens.length} mensagem(ns) · {new Date(t.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLOR[t.status] ?? 'bg-gray-100 text-gray-500'}`}>{STATUS_LABEL[t.status] ?? t.status}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Novo ticket modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900">Novo ticket</h2>
              <button onClick={() => setShowNew(false)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleNovoTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Assunto</label>
                <input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Problema no agendamento" className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Descrição</label>
                <textarea value={mensagem} onChange={e => setMensagem(e.target.value)} placeholder="Descreva seu problema em detalhes..." rows={4} className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none" />
              </div>
              <button type="submit" disabled={sending || !titulo.trim() || !mensagem.trim()} className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 text-sm disabled:opacity-60 transition-colors">
                {sending ? 'Enviando...' : 'Abrir ticket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Ticket detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="font-extrabold text-gray-900">{selected.titulo}</h2>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[selected.status] ?? 'bg-gray-100 text-gray-500'}`}>{STATUS_LABEL[selected.status] ?? selected.status}</span>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-3 min-h-0">
              {selected.mensagens.map((m: any) => (
                <div key={m.id} className={`flex ${m.isAdmin ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${m.isAdmin ? 'bg-gray-100 text-gray-900' : 'bg-green-600 text-white'}`}>
                    <p className={`text-xs font-semibold mb-1 ${m.isAdmin ? 'text-gray-500' : 'text-green-100'}`}>{m.isAdmin ? 'Suporte DirigêJá' : 'Você'}</p>
                    <p className="leading-relaxed">{m.mensagem}</p>
                  </div>
                </div>
              ))}
            </div>
            {selected.status !== 'RESOLVIDO' && selected.status !== 'FECHADO' && (
              <div className="p-4 border-t border-gray-100 flex gap-2">
                <input value={resposta} onChange={e => setResposta(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleResponder() } }} placeholder="Adicionar mensagem..." className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm" />
                <button onClick={handleResponder} disabled={sending || !resposta.trim()} className="px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
