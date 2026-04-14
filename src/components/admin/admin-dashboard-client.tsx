'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Car, Calendar, DollarSign, ShieldAlert, CreditCard, Star } from 'lucide-react'
import type { AdminMetrics } from '@/types'
import { formatCurrency, formatDateShort } from '@/lib/utils'

interface Props {
  metrics: AdminMetrics
  recentUsers: any[]
  kycQueue: any[]
  cidadeStats: any[]
}

const STATUS_STYLES: Record<string, string> = {
  APROVADO: 'bg-green-50 text-green-800 border border-green-200',
  PENDENTE: 'bg-amber-50 text-amber-800 border border-amber-200',
  EM_ANALISE: 'bg-blue-50 text-blue-800 border border-blue-200',
  REJEITADO: 'bg-red-50 text-red-800 border border-red-200',
}

export function AdminDashboardClient({ metrics, recentUsers, kycQueue, cidadeStats }: Props) {
  const router = useRouter()

  const maxCidade = cidadeStats[0]?._count ?? 1

  async function handleKYC(kycId: string, status: string) {
    await fetch(`/api/admin/kyc/${kycId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    router.refresh()
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Visão geral
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Atualizado em tempo real · {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Primary metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, val: metrics.totalAlunos.toLocaleString('pt-BR'), label: 'Total de alunos', delta: `+${metrics.alunosNovosSetmana} esta semana`, color: 'bg-green-50', iconColor: 'text-green-600', deltaColor: 'text-green-600' },
          { icon: Car, val: metrics.instrutoresAtivos.toLocaleString('pt-BR'), label: 'Instrutores ativos', delta: `+${metrics.instrutoresNovosSetmana} esta semana`, color: 'bg-blue-50', iconColor: 'text-blue-600', deltaColor: 'text-blue-600' },
          { icon: Calendar, val: metrics.aulasMes.toLocaleString('pt-BR'), label: 'Aulas este mês', delta: `${metrics.totalAulas.toLocaleString('pt-BR')} no total`, color: 'bg-purple-50', iconColor: 'text-purple-600', deltaColor: 'text-purple-600' },
          { icon: DollarSign, val: formatCurrency(metrics.receitaMes), label: 'Receita mensal', delta: 'via Stripe recorrente', color: 'bg-amber-50', iconColor: 'text-amber-600', deltaColor: 'text-amber-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-4`}>
              <m.icon className={`w-5 h-5 ${m.iconColor}`} />
            </div>
            <div className="text-2xl font-extrabold tracking-tight mb-1" style={{ fontFamily: 'Plus Jakarta Sans' }}>{m.val}</div>
            <div className="text-xs text-gray-500 mb-1">{m.label}</div>
            <div className={`text-xs font-semibold ${m.deltaColor}`}>{m.delta}</div>
          </div>
        ))}
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { icon: ShieldAlert, val: metrics.kycPendentes, label: 'KYC pendentes', sub: 'Aguardando revisão', color: 'text-amber-600', bg: 'bg-amber-50', urgent: true },
          { icon: CreditCard, val: metrics.subscricoesAtivas, label: 'Assinaturas Stripe', sub: 'Planos ativos', color: 'text-green-600', bg: 'bg-green-50', urgent: false },
          { icon: Star, val: `${metrics.mediaAvaliacoes} ★`, label: 'Nota média geral', sub: '+0,04 este mês', color: 'text-amber-500', bg: 'bg-amber-50', urgent: false },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${m.bg} flex items-center justify-center shrink-0`}>
              <m.icon className={`w-6 h-6 ${m.color}`} />
            </div>
            <div>
              <div className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>{m.val}</div>
              <div className="text-xs font-semibold text-gray-700">{m.label}</div>
              <div className={`text-xs ${m.urgent ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>{m.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-6 mb-6">
        {/* Recent users table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Usuários recentes</h3>
            <Link href="/admin/usuarios" className="text-xs text-green-600 font-semibold hover:text-green-700">
              Ver todos →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Nome</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Tipo</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Cadastro</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">KYC</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-900 text-sm">{u.nome}</div>
                      <div className="text-xs text-gray-400">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        u.role === 'INSTRUTOR' ? 'bg-blue-50 text-blue-700' :
                        u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                        'bg-green-50 text-green-700'
                      }`}>
                        {u.role === 'INSTRUTOR' ? 'Instrutor' : u.role === 'ADMIN' ? 'Admin' : 'Aluno'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">
                      {formatDateShort(u.createdAt)}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.kyc ? (
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[u.kyc.status]}`}>
                          {u.kyc.status === 'APROVADO' ? 'Aprovado' :
                           u.kyc.status === 'PENDENTE' ? 'Pendente' :
                           u.kyc.status === 'EM_ANALISE' ? 'Em análise' : 'Rejeitado'}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-5">
          {/* City bar chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Instrutores por cidade</h3>
            <div className="space-y-3">
              {cidadeStats.map(c => (
                <div key={c.cidade} className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20 text-right shrink-0 truncate">{c.cidade}</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500 rounded-full transition-all"
                      style={{ width: `${(c._count / maxCidade) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-gray-700 w-6 text-right">{c._count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KYC queue */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex-1">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-bold text-gray-900">Fila KYC</h3>
              <Link href="/admin/kyc" className="text-xs text-green-600 font-semibold hover:text-green-700">
                Ver todos ({metrics.kycPendentes}) →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {kycQueue.length === 0 ? (
                <p className="text-xs text-gray-400 px-5 py-4">Nenhum pendente.</p>
              ) : kycQueue.map(k => (
                <div key={k.id} className="flex items-center justify-between px-5 py-3.5">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{k.user.nome}</div>
                    <div className="text-xs text-gray-400">
                      {k.user.role === 'INSTRUTOR' ? 'Instrutor' : 'Aluno'} · {formatDateShort(k.createdAt)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleKYC(k.id, 'APROVADO')}
                      className="text-xs font-semibold px-3 py-1.5 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      Aprovar
                    </button>
                    <button
                      onClick={() => handleKYC(k.id, 'REJEITADO')}
                      className="text-xs font-semibold px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
