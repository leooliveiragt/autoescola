import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminPagamentosPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/login')

  const subscriptions = await prisma.subscription.findMany({
    include: { instrutor: { include: { user: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const STATUS_LABEL: Record<string, string> = {
    ATIVA: 'Ativa',
    CANCELADA: 'Cancelada',
    EXPIRADA: 'Expirada',
    TRIAL: 'Trial',
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        Pagamentos e assinaturas ({subscriptions.length})
      </h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Instrutor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor/mês</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Início</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Nenhuma assinatura cadastrada.</td></tr>
            ) : subscriptions.map(s => (
              <tr key={s.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3">
                  <div className="font-medium text-gray-900">{s.instrutor.user.nome}</div>
                  <div className="text-xs text-gray-400">{s.instrutor.user.email}</div>
                </td>
                <td className="px-5 py-3 text-gray-600 capitalize">{s.plano}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    s.status === 'ATIVA' ? 'bg-green-50 text-green-700' :
                    s.status === 'TRIAL' ? 'bg-blue-50 text-blue-700' :
                    s.status === 'CANCELADA' ? 'bg-red-50 text-red-700' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {STATUS_LABEL[s.status] ?? s.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-700 font-semibold">
                  R$ {s.valorMensal.toFixed(2)}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs">
                  {s.inicioEm ? new Date(s.inicioEm).toLocaleDateString('pt-BR') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
