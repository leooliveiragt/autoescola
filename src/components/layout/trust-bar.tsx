import { ShieldCheck, CreditCard, Star, Route } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Instrutores verificados', sub: 'KYC com CNH EAR validada', color: 'text-green-600', bg: 'bg-green-100' },
  { icon: CreditCard, title: 'Pagamento seguro', sub: 'Processado via Stripe', color: 'text-blue-600', bg: 'bg-blue-100' },
  { icon: Star, title: 'Avaliação bidirecional', sub: 'Sistema como Uber', color: 'text-amber-600', bg: 'bg-amber-100' },
  { icon: Route, title: 'Busca por localização', sub: 'Instrutores mais próximos', color: 'text-purple-600', bg: 'bg-purple-100' },
]

export function TrustBar() {
  return (
    <section className="bg-amber-50 border-y border-amber-100 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, sub, color, bg }) => (
            <div key={title} className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">{title}</div>
                <div className="text-xs text-gray-500">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
