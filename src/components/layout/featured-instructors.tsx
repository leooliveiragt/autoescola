'use client'

import Link from 'next/link'
import { Star, MapPin, ShieldCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { Tyre } from './driving-icons'

const FEATURED = [
  { initials: 'JS', name: 'Juliana Santos', cidade: 'São José dos Campos', dist: '1,5 km', rating: 4.9, reviews: 22, price: 130, genero: 'F', bg: 'bg-pink-100', text: 'text-pink-700', tags: ['Iniciantes', 'Automático', 'Ansiedade'], top: true },
  { initials: 'CM', name: 'Carlos Mendes', cidade: 'São José dos Campos', dist: '3,2 km', rating: 4.9, reviews: 47, price: 120, genero: 'M', bg: 'bg-green-100', text: 'text-green-700', tags: ['Baliza', 'Manual', 'Aprovação garantida'], top: true },
  { initials: 'FR', name: 'Fernanda Rocha', cidade: 'Taubaté', dist: '9,1 km', rating: 4.8, reviews: 31, price: 95, genero: 'F', bg: 'bg-purple-100', text: 'text-purple-700', tags: ['CNH-B', 'Prova prática', 'Jovens'], top: false },
  { initials: 'RA', name: 'Roberto Alves', cidade: 'Jacareí', dist: '7,4 km', rating: 4.7, reviews: 58, price: 110, genero: 'M', bg: 'bg-blue-100', text: 'text-blue-700', tags: ['Estrada', 'Manual', 'Veterano'], top: false },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
      ))}
    </div>
  )
}

export function FeaturedInstructors() {
  const { data: session } = useSession()
  const role = session?.user?.role
  const buscar = role === 'INSTRUTOR'
    ? '/instrutor/dashboard'
    : role === 'ADMIN'
    ? '/admin'
    : session
    ? '/buscar'
    : '/login?redirect=/buscar'

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600">Instrutores</span>
            <h2 className="text-4xl font-extrabold tracking-tight mt-2 text-gray-900" style={{ fontFamily: 'Plus Jakarta Sans' }}>
              Os mais bem avaliados
            </h2>
            <p className="text-gray-500 mt-2 text-sm">Cadastre-se para ver todos os instrutores na sua região</p>
          </div>

          {/* Spinning tyre decoration */}
          <div className="hidden md:flex items-center gap-4">
            <Tyre
              className="w-10 h-10 text-gray-300 animate-spin"
              style={{ animationDuration: '4s' }}
            />
            <Link href={buscar} className="text-sm font-semibold text-green-600 hover:text-green-700 border-b border-green-300 pb-0.5">
              Ver todos →
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED.map((inst) => (
            <Link href={buscar} key={inst.initials} className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-green-400 hover:shadow-md transition-all group block">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl ${inst.bg} ${inst.text} flex items-center justify-center font-bold text-lg`}>
                  {inst.initials}
                </div>
                {inst.top ? (
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    ★ Destaque
                  </span>
                ) : (
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" /> KYC
                  </span>
                )}
              </div>

              <h3 className="font-bold text-gray-900 text-sm mb-1">{inst.name}</h3>
              <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                <MapPin className="w-3 h-3 text-gray-400" />
                {inst.cidade} · {inst.dist}
              </div>

              <div className="flex items-center gap-2 mb-3">
                <StarRating rating={inst.rating} />
                <span className="text-xs font-semibold text-gray-700">{inst.rating}</span>
                <span className="text-xs text-gray-400">({inst.reviews})</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-4">
                {inst.tags.map(t => (
                  <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{t}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div>
                  <span className="text-lg font-bold text-gray-900">R${inst.price}</span>
                  <span className="text-xs text-gray-400">/hora</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${inst.genero === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'}`}>
                  {inst.genero === 'F' ? 'Mulher' : 'Homem'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href={buscar} className="inline-block px-8 py-3.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors text-sm shadow-sm">
            {role === 'INSTRUTOR' ? 'Ir para meu painel' : session ? 'Ver todos os instrutores' : 'Cadastre-se e veja todos os instrutores'}
          </Link>
        </div>
      </div>
    </section>
  )
}
