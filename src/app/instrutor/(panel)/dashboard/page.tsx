'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Calendar, Users, Star, DollarSign, Settings, Eye, CalendarDays, AlertTriangle, CreditCard, TrendingDown } from 'lucide-react'

export default function InstructorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [sub, setSub] = useState<any>(null)
  const [subLoaded, setSubLoaded] = useState(false)
  const [saldo, setSaldo] = useState<any>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/instrutor/assinatura')
        .then(r => r.json())
        .then(d => setSub(d.subscription))
        .finally(() => setSubLoaded(true))

      fetch('/api/instrutor/saldo')
        .then(r => r.json())
        .then(d => setSaldo(d))
    }
  }, [status])

  const isPix = sub?.cartaoBandeira === 'PIX'
  const temPagamento = sub?.status === 'ATIVA' || isPix
  const precisaPagar = subLoaded && !temPagamento
  const aguardandoPix = subLoaded && isPix && sub?.status === 'TRIAL'

  if (status === 'loading') return (
    <div className="flex items-center justify-center h-64">
      <div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">

      {/* Banner: precisa assinar */}
      {precisaPagar && (
        <div className="mb-6 bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-amber-900 text-sm">Ative sua assinatura para aparecer nas buscas</p>
            <p className="text-xs text-amber-700 mt-1">
              Seu cadastro foi aprovado! Agora, adicione um cartão de crédito ou pague via PIX para ativar seu perfil e começar a receber alunos.
            </p>
          </div>
          <button
            onClick={() => router.push('/instrutor/assinatura')}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors text-sm"
          >
            <CreditCard className="w-4 h-4" /> Assinar agora
          </button>
        </div>
      )}

      {/* Banner: saldo devedor */}
      {saldo && saldo.saldoDevedor > 0 && (
        <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-red-900 text-sm">Você tem um débito com a plataforma</p>
            <p className="text-xs text-red-700 mt-1">
              Taxa de aulas presenciais agendadas pela DirigêJá: <strong>R$ {saldo.saldoDevedor.toFixed(2)}</strong>.
              Este valor será descontado automaticamente no seu próximo pagamento via plataforma.
            </p>
          </div>
        </div>
      )}

      {/* Banner: PIX aguardando confirmação */}
      {aguardandoPix && (
        <div className="mb-6 bg-blue-50 border-2 border-blue-200 rounded-2xl p-5 flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-xl">
            PIX
          </div>
          <div>
            <p className="font-bold text-blue-900 text-sm">PIX enviado — aguardando confirmação</p>
            <p className="text-xs text-blue-700 mt-1">
              Recebemos sua solicitação de pagamento via PIX. Nossa equipe irá confirmar em até 1 dia útil e seu perfil será ativado.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
          Olá, {session?.user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Bem-vindo ao seu painel de instrutor.</p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Calendar, label: 'Aulas este mês', val: '12', color: 'bg-green-50', iconColor: 'text-green-600' },
          { icon: Users, label: 'Alunos ativos', val: '8', color: 'bg-blue-50', iconColor: 'text-blue-600' },
          { icon: Star, label: 'Avaliação média', val: '4.9 ★', color: 'bg-amber-50', iconColor: 'text-amber-500' },
          { icon: DollarSign, label: 'Receita do mês', val: 'R$1.440', color: 'bg-purple-50', iconColor: 'text-purple-600' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center mb-3`}>
              <m.icon className={`w-5 h-5 ${m.iconColor}`} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 mb-1">{m.val}</div>
            <div className="text-xs text-gray-500">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Próximas aulas */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-4">Próximas aulas</h2>
          <div className="text-sm text-gray-400 text-center py-10">
            <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            Nenhuma aula agendada ainda.
          </div>
        </div>

        {/* Ações rápidas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-base font-bold mb-4">Ações rápidas</h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/instrutor/perfil')}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors text-sm font-medium text-left"
            >
              <Eye className="w-4 h-4 text-green-600" />
              Ver meu perfil público
            </button>
            <button
              onClick={() => router.push('/instrutor/configuracoes')}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors text-sm font-medium text-left"
            >
              <Settings className="w-4 h-4 text-green-600" />
              Configurar disponibilidade
            </button>
            <button
              onClick={() => router.push('/instrutor/aulas')}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors text-sm font-medium text-left"
            >
              <CalendarDays className="w-4 h-4 text-green-600" />
              Ver todas as aulas
            </button>
            <button
              onClick={() => router.push('/instrutor/assinatura')}
              className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-green-300 hover:bg-green-50 transition-colors text-sm font-medium text-left"
            >
              <DollarSign className="w-4 h-4 text-green-600" />
              Minha assinatura
            </button>
          </div>
        </div>
      </div>

      {/* Últimas avaliações */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="text-base font-bold mb-4">Últimas avaliações</h2>
        <div className="text-sm text-gray-400 text-center py-10">
          <Star className="w-10 h-10 mx-auto mb-3 text-gray-200" />
          Nenhuma avaliação ainda.
        </div>
      </div>

    </div>
  )
}
