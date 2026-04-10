'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Star, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { gerarIniciais } from '@/lib/utils'

export default function AvaliarPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const aulaId = searchParams.get('aulaId') || ''
  const alvoId = searchParams.get('alvoId') || ''
  const alvoNome = searchParams.get('nome') || 'Instrutor'

  const [nota, setNota] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comentario, setComentario] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const iniciais = gerarIniciais(alvoNome)

  async function handleSubmit() {
    if (!nota) return
    setLoading(true)

    await fetch('/api/avaliacoes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aulaId, alvoId, nota, comentario }),
    })

    setDone(true)
    setLoading(false)
    setTimeout(() => router.push('/buscar'), 2000)
  }

  const displayNota = hovered || nota

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Avaliação enviada!</h2>
          <p className="text-gray-500 text-sm">Obrigado pelo seu feedback. Redirecionando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Dirige<span className="text-green-600">Já</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-sm">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-3xl bg-green-100 text-green-800 flex items-center justify-center font-bold text-2xl mx-auto mb-5">
            {iniciais}
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>
            Como foi sua aula?
          </h2>
          <p className="text-sm text-gray-500 mb-8">
            {alvoNome} · avalie sua experiência
          </p>

          {/* Stars */}
          <div className="flex justify-center gap-3 mb-4">
            {[1, 2, 3, 4, 5].map(i => (
              <button
                key={i}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setNota(i)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    i <= displayNota ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>

          {nota > 0 && (
            <p className="text-sm font-semibold text-gray-700 mb-6">
              {nota === 5 ? 'Excelente!' : nota === 4 ? 'Muito bom!' : nota === 3 ? 'Regular' : nota === 2 ? 'Ruim' : 'Péssimo'}
            </p>
          )}

          {/* Comment */}
          <textarea
            value={comentario}
            onChange={e => setComentario(e.target.value)}
            placeholder="Descreva sua experiência (opcional)..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm resize-none mb-5 text-left"
          />

          <button
            onClick={handleSubmit}
            disabled={!nota || loading}
            className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Enviar avaliação
          </button>

          <button
            onClick={() => router.push('/buscar')}
            className="w-full py-3 text-sm text-gray-500 hover:text-gray-700 mt-2 transition-colors"
          >
            Pular por agora
          </button>
        </div>
      </div>
    </div>
  )
}
