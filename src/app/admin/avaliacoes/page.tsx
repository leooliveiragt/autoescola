import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'

export default async function AdminAvaliacoesPage() {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') redirect('/')

  const avaliacoes = await prisma.avaliacao.findMany({
    include: {
      autor: { select: { nome: true } },
      alvo: { select: { nome: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold mb-6" style={{ fontFamily: 'Plus Jakarta Sans' }}>
        Avaliações ({avaliacoes.length})
      </h1>
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Autor</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Avaliado</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nota</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Comentário</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
            </tr>
          </thead>
          <tbody>
            {avaliacoes.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Nenhuma avaliação ainda.</td></tr>
            ) : avaliacoes.map(a => (
              <tr key={a.id} className="border-t border-gray-50 hover:bg-gray-50">
                <td className="px-5 py-3 font-medium">{a.autor.nome}</td>
                <td className="px-5 py-3 text-gray-600">{a.alvo.nome}</td>
                <td className="px-5 py-3 text-amber-500 font-bold">{'★'.repeat(a.nota)}{'☆'.repeat(5 - a.nota)}</td>
                <td className="px-5 py-3 text-gray-500 max-w-xs truncate">{a.comentario || '—'}</td>
                <td className="px-5 py-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}