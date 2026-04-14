import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      {/* Amber road stripe at top */}
      <div className="flex gap-4 px-8 h-2">
        {[...Array(20)].map((_, i) => (
          <div key={i} className={`flex-1 h-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-900'}`} />
        ))}
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="text-white font-bold text-lg mb-3" style={{ fontFamily: 'Plus Jakarta Sans' }}>
                Dirige<span className="text-amber-400">Já</span>
              </div>
              <p className="text-xs leading-relaxed text-gray-500">
                Conectamos alunos a instrutores particulares de direção verificados em todo o Brasil.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Plataforma</h4>
              {['Como funciona', 'Buscar instrutores', 'Para instrutores', 'Preços'].map(l => (
                <Link key={l} href="#" className="block text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">{l}</Link>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Suporte</h4>
              {['Central de ajuda', 'Contato', 'Política de cancelamento', 'Segurança'].map(l => (
                <Link key={l} href="#" className="block text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">{l}</Link>
              ))}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-300 mb-3">Legal</h4>
              {['Termos de uso', 'Privacidade', 'Política de cookies', 'KYC e Segurança'].map(l => (
                <Link key={l} href="#" className="block text-xs text-gray-500 hover:text-gray-300 mb-2 transition-colors">{l}</Link>
              ))}
            </div>
          </div>
          <div className="pt-6 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-gray-600">© 2024 DirigêJá. Todos os direitos reservados.</p>
            <p className="text-xs text-gray-600">Pagamentos processados com segurança via Stripe 🔒</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
