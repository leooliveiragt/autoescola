'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Star, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AvaliacaoPrompt() {
  const { data: session } = useSession()
  const router = useRouter()
  const [aulas, setAulas] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [nota, setNota] = useState(0)
  const [hover, setHover] = useState(0)
  const [comentario, setComentario] = useState('')
  const [sending, setSending] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!session) return
    fetch('/api/aulas/pendentes-avaliacao')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d.length > 0) setAulas(d) })
  }, [session])

  if (!session || aulas.length === 0 || dismissed) return null

  const aula = aulas[current]
  const isInstrutor = session.user.role === 'INSTRUTOR'
  const nomeAvaliado = isInstrutor ? aula.aluno?.nome : aula.instrutor?.nome

  async function handleEnviar() {
    if (!nota) return
    setSending(true)
    const endpoint = isInstrutor ? '/api/avaliacoes/instrutor' : '/api/avaliacoes'
    const body = isInstrutor
      ? { aulaId: aula.id, nota, comentario }
      : { aulaId: aula.id, alvoId: aula.instrutorId, nota, comentario }

    await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSending(false)
    setNota(0); setComentario('')
    if (current + 1 < aulas.length) setCurrent(c => c + 1)
    else setDismissed(true)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-amber-400 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-900 fill-amber-900" />
          <span className="text-sm font-bold text-amber-900">Avalie sua aula de hoje</span>
        </div>
        <button onClick={() => setDismissed(true)} className="p-1 rounded-lg hover:bg-amber-300 transition-colors">
          <X className="w-4 h-4 text-amber-900" />
        </button>
      </div>

      <div className="p-4">
        <p className="text-xs text-gray-500 mb-3">
          {isInstrutor ? `Como foi o aluno ${nomeAvaliado}?` : `Como foi a aula com ${nomeAvaliado}?`}
        </p>

        {/* Stars */}
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setNota(i)}
              className="transition-transform hover:scale-110"
            >
              <Star className={`w-8 h-8 ${i <= (hover || nota) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}`} />
            </button>
          ))}
        </div>

        <textarea
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          placeholder="Comentário opcional..."
          rows={2}
          className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none resize-none mb-3"
        />

        <div className="flex gap-2">
          <button
            onClick={handleEnviar}
            disabled={!nota || sending}
            className="flex-1 py-2 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm disabled:opacity-50 transition-colors"
          >
            {sending ? 'Enviando...' : 'Avaliar'}
          </button>
          <button
            onClick={() => { if (current + 1 < aulas.length) setCurrent(c => c + 1); else setDismissed(true) }}
            className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Pular
          </button>
        </div>

        {aulas.length > 1 && (
          <p className="text-center text-xs text-gray-400 mt-2">{current + 1} de {aulas.length} aulas</p>
        )}
      </div>
    </div>
  )
}
