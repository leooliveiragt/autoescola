'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { InstructorCard } from '@/components/instrutor/instructor-card'
import { SearchFilters } from '@/components/instrutor/search-filters'
import { Search, SlidersHorizontal } from 'lucide-react'
import type { PerfilInstrutor, FiltrosInstrutor } from '@/types'

export default function BuscarPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [instrutores, setInstrutores] = useState<PerfilInstrutor[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [query, setQuery] = useState('')
  const [filtros, setFiltros] = useState<FiltrosInstrutor>({
    ordenacao: 'relevancia',
    pagina: 1,
    limite: 12,
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/buscar')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') fetchInstrutores()
  }, [filtros, status])

  async function fetchInstrutores() {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([k, v]) => {
      if (v !== undefined && v !== '') params.set(k, String(v))
    })
    if (query) params.set('q', query)

    try {
      const res = await fetch(`/api/instrutores?${params}`)
      const data = await res.json()
      setInstrutores(data.instrutores || [])
      setTotal(data.total || 0)
    } catch {
      setInstrutores([])
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || status === 'unauthenticated') return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search header */}
      <div className="bg-white border-b border-gray-100 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus-within:border-green-400 transition-colors">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchInstrutores()}
              placeholder="Buscar por cidade, bairro ou nome..."
              className="flex-1 text-sm bg-transparent outline-none placeholder-gray-400"
            />
          </div>
          <button onClick={fetchInstrutores} className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 text-sm transition-colors">
            Buscar
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm font-medium transition-colors ${showFilters ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <aside className={`w-64 shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <SearchFilters filtros={filtros} onChange={setFiltros} />
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {loading ? 'Buscando...' : `${total} instrutores encontrados`}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">na sua região</p>
              </div>
              <select
                value={filtros.ordenacao}
                onChange={e => setFiltros(f => ({ ...f, ordenacao: e.target.value as any }))}
                className="text-sm px-3 py-2 border-2 border-gray-200 rounded-xl focus:border-green-400 focus:outline-none"
              >
                <option value="relevancia">Mais relevantes</option>
                <option value="avaliacao">Melhor avaliação</option>
                <option value="preco_asc">Menor preço</option>
                <option value="preco_desc">Maior preço</option>
                <option value="distancia">Mais próximo</option>
              </select>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse h-36" />
                ))}
              </div>
            ) : instrutores.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <h3 className="text-lg font-bold mb-2">Nenhum instrutor encontrado</h3>
                <p className="text-sm text-gray-500">Tente ajustar os filtros ou buscar em outra cidade.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {instrutores.map(inst => (
                  <InstructorCard key={inst.id} instrutor={inst} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
