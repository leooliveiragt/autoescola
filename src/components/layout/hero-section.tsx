'use client'

import Link from 'next/link'
import { Search, MapPin, Star, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SteeringWheel, Tyre, TrafficLight, Speedometer } from './driving-icons'

const CIDADES_POPULARES = [
  'São José dos Campos', 'Taubaté', 'Campinas', 'São Paulo', 'Jacareí',
]

const FEATURED_CARDS = [
  { initials: 'JS', name: 'Juliana Santos', location: 'SJC, SP', rating: 4.9, reviews: 22, price: 130, bg: 'bg-pink-100', text: 'text-pink-700' },
  { initials: 'CM', name: 'Carlos Mendes', location: 'SJC, SP', rating: 4.9, reviews: 47, price: 120, bg: 'bg-green-100', text: 'text-green-700' },
  { initials: 'RA', name: 'Roberto Alves', location: 'Jacareí, SP', rating: 4.7, reviews: 58, price: 110, bg: 'bg-blue-100', text: 'text-blue-700' },
]

export function HeroSection() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/login?redirect=/buscar${query ? `?q=${encodeURIComponent(query)}` : ''}`)
  }

  return (
    <section className="bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* ── Left ────────────────────────────────────────────── */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Nova regra do Detran 2024 — CNH sem autoescola obrigatória
            </div>

            <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] mb-5" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Aprenda a{' '}
              <span className="text-green-600">dirigir</span>{' '}
              com o instrutor certo
            </h1>

            <p className="text-lg text-gray-500 leading-relaxed mb-8 max-w-md">
              Instrutores particulares verificados, perto de você, com flexibilidade total de horário e preço.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 p-2 bg-white border-2 border-gray-200 rounded-2xl focus-within:border-green-400 transition-colors mb-5 shadow-sm max-w-lg">
              <div className="flex items-center gap-2 flex-1 px-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por cidade, bairro ou CEP..."
                  className="flex-1 text-sm outline-none placeholder-gray-400 bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                Buscar
              </button>
            </form>

            <div className="flex flex-wrap gap-2 mb-10">
              {CIDADES_POPULARES.map((cidade) => (
                <Link
                  key={cidade}
                  href="/login"
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 transition-colors"
                >
                  {cidade}
                </Link>
              ))}
            </div>

            <div className="flex gap-8 pt-8 border-t border-gray-100">
              {[
                { val: '+2.400', label: 'Instrutores' },
                { val: '18.000+', label: 'Aulas realizadas' },
                { val: '4.9 ★', label: 'Nota média' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>{s.val}</div>
                  <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Right ───────────────────────────────────────────── */}
          <div className="hidden lg:block">
            {/* Amber road stripe */}
            <div className="flex gap-2 mb-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-100'}`} />
              ))}
            </div>

            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200">

              {/* ── Driving accessories row ── */}
              <div className="flex items-center justify-between mb-5 px-2">

                {/* Steering wheel — slow spin */}
                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-2.5">
                  <SteeringWheel
                    className="w-full h-full text-gray-700 animate-spin"
                    style={{ animationDuration: '9s' }}
                  />
                </div>

                {/* Traffic light */}
                <div className="w-14 h-28 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-2">
                  <TrafficLight active="green" className="w-full h-full" />
                </div>

                {/* Tyre — slow spin opposite direction */}
                <div className="w-14 h-14 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-2">
                  <Tyre
                    className="w-full h-full text-gray-700 animate-spin"
                    style={{ animationDuration: '5s', animationDirection: 'reverse' }}
                  />
                </div>

                {/* Speedometer */}
                <div className="w-20 h-14 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center p-2">
                  <Speedometer className="w-full h-full" />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 mb-4" />

              {/* Instructor cards */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Instrutores em destaque
                </p>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3 h-3" />
                  Verificados
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {FEATURED_CARDS.map((c) => (
                  <div
                    key={c.initials}
                    className="bg-white rounded-2xl p-4 border border-gray-200 flex items-center gap-4 hover:border-green-400 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => router.push('/login')}
                  >
                    <div className={`w-11 h-11 rounded-full ${c.bg} ${c.text} flex items-center justify-center font-bold text-sm shrink-0`}>
                      {c.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.location}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span className="text-xs font-semibold text-gray-700">{c.rating}</span>
                        <span className="text-xs text-gray-400">({c.reviews})</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-bold text-green-600">R${c.price}</div>
                      <div className="text-xs text-gray-400">/hora</div>
                    </div>
                  </div>
                ))}
                <Link
                  href="/login"
                  className="w-full py-3 text-sm font-semibold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors text-center"
                >
                  Ver todos os instrutores →
                </Link>
              </div>
            </div>

            {/* Bottom amber stripe */}
            <div className="flex gap-2 mt-3">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i % 2 === 0 ? 'bg-amber-400' : 'bg-amber-100'}`} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
