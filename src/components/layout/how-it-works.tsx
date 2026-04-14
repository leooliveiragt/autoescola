import { UserPlus, Search, CalendarCheck } from 'lucide-react'
import { TrafficLight, TrafficCone } from './driving-icons'

const STEPS = [
  {
    num: '01',
    icon: UserPlus,
    title: 'Crie sua conta grátis',
    desc: 'Cadastro rápido com verificação de identidade (KYC). Seus dados protegidos com criptografia.',
  },
  {
    num: '02',
    icon: Search,
    title: 'Escolha seu instrutor',
    desc: 'Filtre por localização, preço, gênero e avaliação. Perfis completos com depoimentos reais.',
  },
  {
    num: '03',
    icon: CalendarCheck,
    title: 'Agende e dirija',
    desc: 'Escolha data, horário e pague com segurança via Stripe. Após a aula, avalie o instrutor.',
  },
]

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">

        {/* Header + Traffic light */}
        <div className="flex items-start justify-between mb-14">
          <div className="text-center flex-1">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Como funciona</span>
            <h2 className="text-4xl font-extrabold tracking-tight mt-2 text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Simples, rápido e seguro
            </h2>
            <p className="text-gray-500 mt-3 text-base max-w-md mx-auto">
              Três passos para você começar a aprender a dirigir com o instrutor ideal.
            </p>
          </div>
          {/* Traffic light — decorative right */}
          <div className="hidden lg:flex flex-col items-center gap-1 shrink-0 ml-6">
            <TrafficLight active="green" className="w-10 h-20" />
          </div>
        </div>

        {/* Steps */}
        <div className="relative grid md:grid-cols-3 gap-8">
          {/* Dashed road connector */}
          <div className="hidden md:block absolute top-10 left-[calc(16.66%+2rem)] right-[calc(16.66%+2rem)] h-0.5 border-t-2 border-dashed border-gray-300" />

          {STEPS.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.num} className="flex flex-col items-start md:items-center text-left md:text-center">
                {/* Diamond road-sign badge */}
                <div className="relative w-20 h-20 flex items-center justify-center mb-6 shrink-0">
                  <div className="absolute inset-0 rotate-45 rounded-xl bg-amber-400 shadow-md shadow-amber-200" />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <Icon className="w-5 h-5 text-gray-900" strokeWidth={2.5} />
                    <span className="text-[10px] font-black text-gray-900 leading-none mt-0.5 tracking-tight">{s.num}</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border-2 border-gray-100 hover:border-amber-300 transition-colors p-6 w-full">
                  <h3 className="text-base font-bold mb-2 text-gray-900">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Road scene below steps */}
        <div className="mt-14 relative">
          {/* Asphalt strip */}
          <div className="h-16 bg-gray-800 rounded-2xl flex items-center relative">
            {/* Edge lines */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-400 opacity-60 rounded-t-2xl" />
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-400 opacity-60 rounded-b-2xl" />
            {/* Center dashed line */}
            <div className="absolute inset-0 flex items-center px-6">
              <div className="flex gap-3 w-full">
                {[...Array(22)].map((_, i) => (
                  <div key={i} className="h-0.5 flex-1 bg-white rounded-full opacity-40" />
                ))}
              </div>
            </div>
            {/* Car emoji driving */}
            <span
              className="absolute left-1/4 leading-none select-none"
              style={{ fontSize: '5.5rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))', transform: 'translateY(-18%) scaleX(-1)' }}
            >🚗</span>
          </div>

          {/* Cones flanking */}
          <div className="absolute -top-4 left-4 hidden sm:block">
            <TrafficCone className="w-8 h-10" />
          </div>
          <div className="absolute -top-4 right-4 hidden sm:block">
            <TrafficCone className="w-8 h-10" />
          </div>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 hidden sm:block">
            <TrafficCone className="w-6 h-8 opacity-50" />
          </div>
        </div>

      </div>
    </section>
  )
}
