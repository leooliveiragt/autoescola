'use client'
import { ShieldCheck, CreditCard, Star, MapPin } from 'lucide-react'

const TRUST_ITEMS = [
  { icon: ShieldCheck, title: 'Instrutores verificados', sub: 'KYC com CNH EAR validada' },
  { icon: CreditCard, title: 'Pagamento seguro', sub: 'Processado via Stripe' },
  { icon: Star, title: 'Avaliação bidirecional', sub: 'Sistema como Uber' },
  { icon: MapPin, title: 'Busca por localização', sub: 'Instrutores mais próximos primeiro' },
]

export function TrustBar() {
  return (
    <section className="bg-gray-50 border-y border-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_ITEMS.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-green-700" />
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
