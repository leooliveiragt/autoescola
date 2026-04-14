import Link from 'next/link'
import { Star, MapPin, Heart } from 'lucide-react'
import type { PerfilInstrutor } from '@/types'
import { formatCurrency, gerarIniciais } from '@/lib/utils'

interface Props {
  instrutor: PerfilInstrutor
}

const AVATAR_COLORS = [
  { bg: 'bg-green-100', text: 'text-green-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
]

function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${s} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`}
        />
      ))}
    </div>
  )
}

export function InstructorCard({ instrutor }: Props) {
  const colorIdx = instrutor.userId.charCodeAt(0) % AVATAR_COLORS.length
  const color = AVATAR_COLORS[colorIdx]
  const iniciais = gerarIniciais(instrutor.user?.nome || 'IN')

  return (
    <div className="bg-white rounded-2xl border-2 border-gray-100 p-5 hover:border-green-300 hover:shadow-sm transition-all group">
      <div className="flex gap-5">
        {/* Avatar */}
        <div className={`w-16 h-16 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center font-bold text-xl shrink-0`}>
          {instrutor.user?.avatarUrl
            ? <img src={instrutor.user.avatarUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            : iniciais
          }
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{instrutor.user?.nome}</h3>
                {instrutor.user?.genero && (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    instrutor.user.genero === 'F' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {instrutor.user.genero === 'F' ? 'Mulher' : 'Homem'}
                  </span>
                )}
                {instrutor.mediaAvaliacao >= 4.8 && (
                  <span className="text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    ★ Destaque
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <MapPin className="w-3 h-3" />
                <span>{instrutor.user?.enderecos?.[0]?.cidade}</span>
                {instrutor.distanciaKm != null && (
                  <span className="text-gray-400">· {instrutor.distanciaKm.toFixed(1)} km</span>
                )}
              </div>
            </div>

            {/* Price and fav */}
            <div className="flex items-start gap-2 shrink-0">
              <button className="p-1.5 rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors">
                <Heart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={instrutor.mediaAvaliacao} />
            <span className="text-sm font-semibold text-gray-800">{instrutor.mediaAvaliacao.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({instrutor.totalAvaliacoes} avaliações)</span>
          </div>

          {/* Bio */}
          {instrutor.bio && (
            <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">{instrutor.bio}</p>
          )}

          {/* Tags */}
          {instrutor.especialidades?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {instrutor.especialidades.slice(0, 4).map(t => (
                <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right — price + CTA */}
        <div className="flex flex-col items-end justify-between shrink-0 min-w-[130px]">
          <div className="text-right">
            <div className="text-xl font-extrabold text-gray-900">{formatCurrency(instrutor.precoPorHora)}</div>
            <div className="text-xs text-gray-400">por hora</div>
            {instrutor.distanciaKm != null && (
              <div className="text-xs text-gray-400 mt-1">{instrutor.distanciaKm.toFixed(1)} km de você</div>
            )}
          </div>
          <Link
            href={`/instrutor/${instrutor.id}`}
            className="mt-3 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors whitespace-nowrap"
          >
            Ver perfil
          </Link>
        </div>
      </div>
    </div>
  )
}
