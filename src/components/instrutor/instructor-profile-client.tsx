'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Star, MapPin, Shield, ChevronLeft, Clock, Users, Award, Car } from 'lucide-react'
import type { PerfilInstrutor, Avaliacao } from '@/types'
import { formatCurrency, gerarIniciais, diasSemana } from '@/lib/utils'

interface Props {
  perfil: PerfilInstrutor & { user: any; disponibilidades: any[] }
  avaliacoes: (Avaliacao & { autor: { nome: string } })[]
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' }
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} className={`${sizes[size]} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

const AVATAR_COLORS = [
  { bg: 'bg-green-100', text: 'text-green-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
]

export function InstructorProfileClient({ perfil, avaliacoes }: Props) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sobre' | 'avaliacoes' | 'agenda'>('sobre')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(1)

  const colorIdx = perfil.userId.charCodeAt(0) % AVATAR_COLORS.length
  const color = AVATAR_COLORS[colorIdx]
  const iniciais = gerarIniciais(perfil.user?.nome || 'IN')
  const totalAula = perfil.precoPorHora * duration
  const taxa = totalAula * 0.1
  const total = totalAula + taxa

  const endereco = perfil.user?.enderecos?.[0]
  const kycAprovado = perfil.user?.kyc?.status === 'APROVADO'

  function handleAgendar() {
    if (!date || !time) return
    router.push(`/agendar/${perfil.id}?data=${date}&hora=${time}&duracao=${duration}`)
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Breadcrumb */}
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Voltar para instrutores
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* LEFT */}
        <div>
          {/* Header */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5">
            <div className="flex items-start gap-5">
              <div className={`w-24 h-24 rounded-3xl ${color.bg} ${color.text} flex items-center justify-center font-bold text-3xl shrink-0`}>
                {perfil.user?.avatarUrl
                  ? <img src={perfil.user.avatarUrl} alt="" className="w-full h-full rounded-3xl object-cover" />
                  : iniciais
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                    {perfil.user?.nome}
                  </h1>
                  {perfil.user?.genero && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      perfil.user.genero === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {perfil.user.genero === 'F' ? 'Mulher' : 'Homem'}
                    </span>
                  )}
                  {perfil.mediaAvaliacao >= 4.8 && (
                    <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      ★ Destaque
                    </span>
                  )}
                </div>

                {endereco && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
                    <MapPin className="w-3.5 h-3.5" />
                    {endereco.cidade}, {endereco.estado}
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <StarRating rating={perfil.mediaAvaliacao} size="md" />
                  <span className="font-bold text-gray-900">{perfil.mediaAvaliacao.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({perfil.totalAvaliacoes} avaliações)</span>
                </div>

                {/* Verified badges */}
                <div className="flex flex-wrap gap-2">
                  {kycAprovado && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-full">
                      <Shield className="w-3.5 h-3.5" /> Identidade verificada
                    </span>
                  )}
                  {perfil.cnhEAR && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-800 border border-green-200 px-3 py-1.5 rounded-full">
                      <Shield className="w-3.5 h-3.5" /> CNH EAR ativa
                    </span>
                  )}
                  <span className="flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1.5 rounded-full">
                    <Shield className="w-3.5 h-3.5" /> Endereço confirmado
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-3 mt-5 pt-5 border-t border-gray-100">
              {[
                { icon: Clock, val: `${perfil.anosExperiencia} anos`, label: 'Experiência' },
                { icon: Users, val: `${perfil.totalAlunos}+`, label: 'Alunos' },
                { icon: Award, val: perfil.taxaAprovacao ? `${perfil.taxaAprovacao}%` : '—', label: 'Aprovação' },
                { icon: Car, val: perfil.transmissoes?.join(', ') || '—', label: 'Transmissão' },
              ].map(({ icon: Icon, val, label }) => (
                <div key={label} className="text-center p-3 bg-gray-50 rounded-xl">
                  <Icon className="w-5 h-5 text-green-600 mx-auto mb-1" />
                  <div className="text-sm font-bold text-gray-900">{val}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-100">
              {(['sobre', 'avaliacoes', 'agenda'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 text-sm font-semibold transition-colors border-b-2 ${
                    activeTab === tab ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab === 'sobre' ? 'Sobre' : tab === 'avaliacoes' ? `Avaliações (${perfil.totalAvaliacoes})` : 'Disponibilidade'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'sobre' && (
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-5">{perfil.bio || 'Sem bio cadastrada.'}</p>
                  {perfil.especialidades?.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-3">Especialidades</h3>
                      <div className="flex flex-wrap gap-2">
                        {perfil.especialidades.map(e => (
                          <span key={e} className="text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-800 border border-green-200 font-medium">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'avaliacoes' && (
                <div className="divide-y divide-gray-100">
                  {avaliacoes.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4">Nenhuma avaliação ainda.</p>
                  ) : avaliacoes.map(av => (
                    <div key={av.id} className="py-5">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                            {gerarIniciais((av as any).autor.nome)}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{(av as any).autor.nome}</span>
                        </div>
                        <StarRating rating={av.nota} size="sm" />
                      </div>
                      {av.comentario && (
                        <p className="text-sm text-gray-500 leading-relaxed ml-11">{av.comentario}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'agenda' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">Horários disponíveis esta semana:</p>
                  <div className="grid grid-cols-7 gap-2">
                    {diasSemana.map(d => (
                      <div key={d} className="text-center text-xs font-bold text-gray-400 pb-1">{d}</div>
                    ))}
                    {perfil.disponibilidades?.map(disp => (
                      <div key={disp.id} className="text-center text-xs py-2 bg-green-50 text-green-800 border border-green-200 rounded-lg font-medium cursor-pointer hover:bg-green-100 transition-colors">
                        {disp.horaInicio}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — booking card */}
        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
            <div className="text-center pb-5 border-b border-gray-100 mb-5">
              <div className="text-4xl font-extrabold tracking-tight text-gray-900">
                {formatCurrency(perfil.precoPorHora)}
              </div>
              <div className="text-sm text-gray-500 mt-1">por hora</div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <StarRating rating={perfil.mediaAvaliacao} size="sm" />
                <span className="text-sm font-semibold text-gray-700">{perfil.mediaAvaliacao.toFixed(1)}</span>
                <span className="text-xs text-gray-400">· {perfil.totalAvaliacoes} avaliações</span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Data</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Horário</label>
                <select value={time} onChange={e => setTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm">
                  <option value="">Selecione um horário</option>
                  {['07:00','08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00'].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1.5">Duração</label>
                <select value={duration} onChange={e => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm">
                  <option value={1}>1 hora — {formatCurrency(perfil.precoPorHora)}</option>
                  <option value={2}>2 horas — {formatCurrency(perfil.precoPorHora * 2)}</option>
                  <option value={3}>3 horas — {formatCurrency(perfil.precoPorHora * 3)}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 py-4 border-t border-gray-100">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{duration}h × {formatCurrency(perfil.precoPorHora)}</span>
                <span>{formatCurrency(totalAula)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Taxa da plataforma (10%)</span>
                <span>{formatCurrency(taxa)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <button
              onClick={handleAgendar}
              disabled={!date || !time}
              className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              Agendar e pagar
            </button>

            <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
              <span>🔒</span> Pagamento seguro via Stripe
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
