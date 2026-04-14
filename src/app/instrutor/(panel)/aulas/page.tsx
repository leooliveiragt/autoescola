'use client'

import { useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Phone,
  Mail,
  MessageCircle,
  Search,
  Calendar,
  DollarSign,
} from 'lucide-react'

type Aluno = {
  id: string
  nome: string
  email: string
  telefone: string | null
  avatarUrl: string | null
}

type Aula = {
  id: string
  data: string
  duracaoHoras: number
  precoPorHora: number
  totalPago: number
  status: 'AGENDADA' | 'CONFIRMADA' | 'REALIZADA' | 'CANCELADA'
  aluno: Aluno
}

const STATUS_LABELS: Record<string, string> = {
  AGENDADA: 'Agendada',
  CONFIRMADA: 'Confirmada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
}

const STATUS_CLASSES: Record<string, string> = {
  AGENDADA: 'bg-amber-50 text-amber-700 border border-amber-200',
  CONFIRMADA: 'bg-blue-50 text-blue-700 border border-blue-200',
  REALIZADA: 'bg-green-50 text-green-700 border border-green-200',
  CANCELADA: 'bg-red-50 text-red-700 border border-red-200',
}

const ALL_STATUSES = ['Todas', 'Agendada', 'Confirmada', 'Realizada', 'Cancelada']

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function whatsappLink(telefone: string) {
  const digits = telefone.replace(/\D/g, '')
  return `https://wa.me/55${digits}`
}

export default function InstructorAulasPage() {
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Todas')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/aulas/instrutor')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAulas(data)
      })
      .finally(() => setLoading(false))
  }, [])

  // Stats
  const total = aulas.length
  const realizadas = aulas.filter(a => a.status === 'REALIZADA').length
  const receita = aulas
    .filter(a => a.status === 'REALIZADA')
    .reduce((sum, a) => sum + a.totalPago, 0)

  // Filtering
  const filtered = aulas.filter(a => {
    const matchSearch = a.aluno.nome.toLowerCase().includes(search.toLowerCase())
    const matchStatus =
      filterStatus === 'Todas' || STATUS_LABELS[a.status] === filterStatus
    return matchSearch && matchStatus
  })

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-extrabold tracking-tight text-gray-900"
          style={{ fontFamily: 'Plus Jakarta Sans' }}
        >
          Minhas Aulas
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie e acompanhe todas as suas aulas agendadas.
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">{total}</div>
          <div className="text-xs text-gray-500">Total de aulas</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <Calendar className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">{realizadas}</div>
          <div className="text-xs text-gray-500">Aulas realizadas</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <DollarSign className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-gray-900 mb-1">
            {formatCurrency(receita)}
          </div>
          <div className="text-xs text-gray-500">Receita total</div>
        </div>
      </div>

      {/* Search + filter chips */}
      <div className="mb-5 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nome do aluno..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white"
          />
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          {ALL_STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
                filterStatus === s
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300 hover:text-green-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-7 h-7 text-gray-300" />
          </div>
          <h3 className="text-base font-bold text-gray-800 mb-1">Nenhuma aula encontrada</h3>
          <p className="text-sm text-gray-500">
            {aulas.length === 0
              ? 'Quando alunos agendarem aulas com você, elas aparecerão aqui.'
              : 'Tente ajustar os filtros para ver mais resultados.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Aluno
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Data / Hora
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Duração
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Valor
                </th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-5 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const isExpanded = expandedId === a.id
                return (
                  <>
                    <tr
                      key={a.id}
                      className={`border-t border-gray-50 cursor-pointer transition-colors ${
                        isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleExpand(a.id)}
                    >
                      {/* Aluno */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {a.aluno.avatarUrl ? (
                            <img
                              src={a.aluno.avatarUrl}
                              alt={a.aluno.nome}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-green-700">
                                {a.aluno.nome.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-gray-900">{a.aluno.nome}</span>
                        </div>
                      </td>

                      {/* Data / Hora */}
                      <td className="px-5 py-3.5 text-gray-600">
                        <div className="font-medium">{formatDate(a.data)}</div>
                        <div className="text-xs text-gray-400">{formatTime(a.data)}</div>
                      </td>

                      {/* Duração */}
                      <td className="px-5 py-3.5 text-gray-600">
                        {a.duracaoHoras}h
                      </td>

                      {/* Valor */}
                      <td className="px-5 py-3.5 font-semibold text-green-700">
                        {formatCurrency(a.totalPago)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
                            STATUS_CLASSES[a.status] ?? 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {STATUS_LABELS[a.status] ?? a.status}
                        </span>
                      </td>

                      {/* Chevron */}
                      <td className="px-5 py-3.5 text-gray-400">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </td>
                    </tr>

                    {/* Expanded panel */}
                    {isExpanded && (
                      <tr key={`${a.id}-expanded`} className="border-t border-gray-100">
                        <td colSpan={6} className="px-5 pb-5 pt-3 bg-gray-50">
                          <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            {/* Avatar large */}
                            <div className="shrink-0">
                              {a.aluno.avatarUrl ? (
                                <img
                                  src={a.aluno.avatarUrl}
                                  alt={a.aluno.nome}
                                  className="w-14 h-14 rounded-2xl object-cover"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                                  <span className="text-xl font-extrabold text-green-700">
                                    {a.aluno.nome.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 text-sm mb-2">{a.aluno.nome}</p>
                              <div className="flex flex-col sm:flex-row gap-2">
                                {/* Email */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="truncate">{a.aluno.email}</span>
                                </div>

                                {/* Telefone */}
                                {a.aluno.telefone && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                    <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                    <span>{a.aluno.telefone}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* WhatsApp button */}
                            {a.aluno.telefone && (
                              <a
                                href={whatsappLink(a.aluno.telefone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-colors"
                              >
                                <MessageCircle className="w-4 h-4" />
                                WhatsApp
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
