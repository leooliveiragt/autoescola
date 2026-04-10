import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          <div>
            <div className="text-white font-bold text-lg mb-4" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Dirige<span className="text-green-400">Já</span>
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Conectamos alunos a instrutores particulares de direção verificados em todo o Brasil.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Plataforma</h4>
            {['Como funciona', 'Buscar instrutores', 'Para instrutores', 'Preços'].map(l => (
              <Link key={l} href="#" className="block text-xs text-gray-500 hover:text-gray-300 mb-2">{l}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Suporte</h4>
            {['Central de ajuda', 'Contato', 'Política de cancelamento', 'Segurança'].map(l => (
              <Link key={l} href="#" className="block text-xs text-gray-500 hover:text-gray-300 mb-2">{l}</Link>
            ))}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-3">Legal</h4>
            {['Termos de uso', 'Privacidade', 'Política de cookies', 'KYC e Segurança'].map(l => (
              <Link key={l} href="#" className="block text-xs text-gray-500 hover:text-gray-300 mb-2">{l}</Link>
            ))}
          </div>
        </div>
        <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">© 2024 DirigêJá. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-600">Pagamentos processados com segurança via Stripe 🔒</p>
        </div>
      </div>
    </footer>
  )
}
