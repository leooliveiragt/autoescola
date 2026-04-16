'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

// Generates time slots from 05:00 to 23:00 in 30-min intervals
const HORARIOS = Array.from({ length: 37 }, (_, i) => {
  const totalMinutes = 5 * 60 + i * 30
  const h = Math.floor(totalMinutes / 60).toString().padStart(2, '0')
  const m = (totalMinutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
})

interface Slot {
  id: string // local temp id
  diaSemana: number
  horaInicio: string
  horaFim: string
}

export default function InstructorConfigPage() {
  const { status } = useSession()
  const router = useRouter()

  // Profile settings
  const [preco, setPreco] = useState('')
  const [bio, setBio] = useState('')
  const [raio, setRaio] = useState('20')
  const [modoRecebimento, setModoRecebimento] = useState<'PLATAFORMA' | 'DIRETO'>('PLATAFORMA')
  const [pixChave, setPixChave] = useState('')
  const [savingConfig, setSavingConfig] = useState(false)
  const [savedConfig, setSavedConfig] = useState(false)

  // Availability
  const [slots, setSlots] = useState<Slot[]>([])
  const [savingDisp, setSavingDisp] = useState(false)
  const [savedDisp, setSavedDisp] = useState(false)
  const [fetchingDisp, setFetchingDisp] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  // Load existing config
  useEffect(() => {
    fetch('/api/instrutor/perfil')
      .then(r => r.json())
      .then(data => {
        if (data.precoPorHora) setPreco(String(data.precoPorHora))
        if (data.bio) setBio(data.bio)
        if (data.raioAtendimentoKm) setRaio(String(data.raioAtendimentoKm))
        if (data.modoRecebimento) setModoRecebimento(data.modoRecebimento)
        if (data.pixChave) setPixChave(data.pixChave)
      })
  }, [])

  // Load existing availability
  useEffect(() => {
    fetch('/api/instrutor/disponibilidade')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setSlots(data.map((d: any) => ({
            id: d.id,
            diaSemana: d.diaSemana,
            horaInicio: d.horaInicio,
            horaFim: d.horaFim,
          })))
        }
      })
      .finally(() => setFetchingDisp(false))
  }, [])

  function addSlot(diaSemana: number) {
    setSlots(s => [...s, {
      id: `new-${Date.now()}-${Math.random()}`,
      diaSemana,
      horaInicio: '08:00',
      horaFim: '12:00',
    }])
  }

  function removeSlot(id: string) {
    setSlots(s => s.filter(sl => sl.id !== id))
  }

  function updateSlot(id: string, field: 'horaInicio' | 'horaFim', value: string) {
    setSlots(s => s.map(sl => sl.id === id ? { ...sl, [field]: value } : sl))
  }

  async function handleSaveConfig() {
    setSavingConfig(true)
    await fetch('/api/instrutor/configuracoes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ precoPorHora: Number(preco), bio, raioAtendimentoKm: Number(raio), modoRecebimento, pixChave }),
    })
    setSavingConfig(false)
    setSavedConfig(true)
    setTimeout(() => setSavedConfig(false), 3000)
  }

  async function handleSaveDisponibilidade() {
    setSavingDisp(true)
    await fetch('/api/instrutor/disponibilidade', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slots.map(({ diaSemana, horaInicio, horaFim }) => ({ diaSemana, horaInicio, horaFim }))),
    })
    setSavingDisp(false)
    setSavedDisp(true)
    setTimeout(() => setSavedDisp(false), 3000)
  }

  if (status === 'loading') return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        Configurações do perfil
      </h1>

      {/* Informações profissionais */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4">Informações profissionais</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Preço por hora (R$)</label>
              <input
                type="number"
                value={preco}
                onChange={e => setPreco(e.target.value)}
                placeholder="Ex: 120"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Raio de atendimento (km)</label>
              <input
                type="number"
                value={raio}
                onChange={e => setRaio(e.target.value)}
                placeholder="Ex: 20"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Aceita pagamento presencial */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Aceita pagamento presencial?</label>
            <p className="text-xs text-gray-400 mb-3">O pagamento via plataforma (cartão/PIX) está sempre disponível. Aqui você define se o aluno também pode pagar diretamente na hora da aula.</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModoRecebimento('PLATAFORMA')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${modoRecebimento === 'PLATAFORMA' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-sm font-bold text-gray-900 mb-1">Não, só pela plataforma</div>
                <div className="text-xs text-gray-500 leading-snug">O aluno paga online ao agendar. Mais seguro e organizado.</div>
                {modoRecebimento === 'PLATAFORMA' && <div className="mt-2 text-xs font-semibold text-green-600">✓ Selecionado</div>}
              </button>
              <button
                type="button"
                onClick={() => setModoRecebimento('DIRETO')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${modoRecebimento === 'DIRETO' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <div className="text-sm font-bold text-gray-900 mb-1">Sim, também presencial</div>
                <div className="text-xs text-gray-500 leading-snug">O aluno pode optar por pagar em dinheiro, PIX ou cartão na hora da aula.</div>
                {modoRecebimento === 'DIRETO' && <div className="mt-2 text-xs font-semibold text-amber-600">✓ Selecionado</div>}
              </button>
            </div>
            {modoRecebimento === 'DIRETO' && (
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700 leading-relaxed">
                ⚠️ Aulas pagas presencialmente geram uma taxa para a plataforma que será cobrada no seu próximo repasse.
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Bio / Sobre você</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Descreva sua experiência, método de ensino e especialidades..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">Chave PIX para repasse</label>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-3">
              <p className="text-xs text-blue-800 font-semibold mb-1">Atenção — requisito obrigatório</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                A chave PIX cadastrada <strong>deve estar no seu nome</strong> — CPF, e-mail, telefone ou chave aleatória, desde que a conta pertença a você. Repasses enviados para chaves de terceiros serão bloqueados.
              </p>
            </div>
            <input
              type="text"
              value={pixChave}
              onChange={e => setPixChave(e.target.value)}
              placeholder="Ex: 000.000.000-00 (CPF) ou seu@email.com"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
            />
            {!pixChave && (
              <p className="text-xs text-amber-600 mt-1.5">
                ⚠️ Sem chave PIX cadastrada você não poderá receber repasses da plataforma.
              </p>
            )}
          </div>
        </div>
        {savedConfig && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
            ✓ Configurações salvas!
          </div>
        )}
        <button
          onClick={handleSaveConfig}
          disabled={savingConfig}
          className="mt-4 w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar informações
        </button>
      </div>

      {/* Disponibilidade semanal */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Disponibilidade semanal</h2>
        </div>
        <p className="text-xs text-gray-400 mb-5">
          Adicione quantos blocos de horário quiser por dia — ex: 7h–12h e depois 18h–21h.
        </p>

        {fetchingDisp ? (
          <div className="flex justify-center py-6">
            <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-5">
            {DIAS.map((dia, diaIndex) => {
              const diaSlots = slots.filter(s => s.diaSemana === diaIndex)
              return (
                <div key={dia}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700 w-16">{dia}</span>
                      {diaSlots.length > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {diaSlots.length} {diaSlots.length === 1 ? 'horário' : 'horários'}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => addSlot(diaIndex)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-green-600 hover:text-green-700 px-2.5 py-1.5 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar horário
                    </button>
                  </div>

                  {diaSlots.length === 0 ? (
                    <div className="text-xs text-gray-400 pl-1 pb-1">Sem horários — dia não disponível</div>
                  ) : (
                    <div className="space-y-2 pl-0">
                      {diaSlots.map(slot => (
                        <div key={slot.id} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5">
                          <div className="flex items-center gap-2 flex-1">
                            <select
                              value={slot.horaInicio}
                              onChange={e => updateSlot(slot.id, 'horaInicio', e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-green-500 focus:outline-none bg-white"
                            >
                              {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <span className="text-xs text-gray-400 font-medium">até</span>
                            <select
                              value={slot.horaFim}
                              onChange={e => updateSlot(slot.id, 'horaFim', e.target.value)}
                              className="px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:border-green-500 focus:outline-none bg-white"
                            >
                              {HORARIOS.filter(h => h > slot.horaInicio).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                          </div>
                          <button
                            onClick={() => removeSlot(slot.id)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {diaIndex < 6 && <div className="border-b border-gray-100 mt-4" />}
                </div>
              )
            })}
          </div>
        )}

        {savedDisp && (
          <div className="mt-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">
            ✓ Disponibilidade salva!
          </div>
        )}
        <button
          onClick={handleSaveDisponibilidade}
          disabled={savingDisp}
          className="mt-5 w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {savingDisp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar disponibilidade
        </button>
      </div>
    </div>
  )
}
