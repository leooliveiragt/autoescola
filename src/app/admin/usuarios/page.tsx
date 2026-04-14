import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminUsuariosPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { kyc: true },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        Todos os usuários ({users.length})
      </h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">E-mail</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">KYC</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{u.nome}</td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    u.role === 'INSTRUTOR' ? 'bg-blue-50 text-blue-700' :
                    u.role === 'ADMIN' ? 'bg-purple-50 text-purple-700' :
                    'bg-green-50 text-green-700'
                  }`}>
                    {u.role === 'INSTRUTOR' ? 'Instrutor' : u.role === 'ADMIN' ? 'Admin' : 'Aluno'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {u.kyc ? (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      u.kyc.status === 'APROVADO' ? 'bg-green-50 text-green-700' :
                      u.kyc.status === 'PENDENTE' ? 'bg-amber-50 text-amber-700' :
                      'bg-red-50 text-red-700'
                    }`}>
                      {u.kyc.status}
                    </span>
                  ) : <span className="text-gray-400 text-xs">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}