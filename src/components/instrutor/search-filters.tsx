'use client'

import { useState } from 'react'
import { Loader2, MapPin } from 'lucide-react'
import type { FiltrosInstrutor } from '@/types'

interface Props {
  filtros: FiltrosInstrutor
  onChange: (f: FiltrosInstrutor) => void
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{label}</h4>
      {children}
    </div>
  )
}

function ChipButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full border-2 text-xs font-medium transition-colors ${
        active ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  )
}

export function SearchFilters({ filtros, onChange }: Props) {
  const [cepInput, setCepInput] = useState(filtros.cepAluno ?? '')
  const [cepLoading, setCepLoading] = useState(false)
  const [cepError, setCepError] = useState('')

  function set(key: keyof FiltrosInstrutor, value: any) {
    onChange({ ...filtros, [key]: value, pagina: 1 })
  }

  async function handleCepBlur() {
    const clean = cepInput.replace(/\D/g, '')
    if (clean.length !== 8) {
      if (clean.length > 0) setCepError('CEP inválido')
      return
    }
    setCepError('')
    setCepLoading(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cep/v2/${clean}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      const lat = data.location?.coordinates?.latitude
        ? parseFloat(data.location.coordinates.latitude)
        : null
      const lon = data.location?.coordinates?.longitude
        ? parseFloat(data.location.coordinates.longitude)
        : null
      if (lat === null || lon === null) {
        setCepError('Não foi possível obter coordenadas para este CEP.')
        return
      }
      onChange({ ...filtros, cepAluno: clean, lat, lon, pagina: 1 })
    } catch {
      setCepError('CEP não encontrado.')
    } finally {
      setCepLoading(false)
    }
  }

  function clearCep() {
    setCepInput('')
    setCepError('')
    const { cepAluno: _, lat: _lat, lon: _lon, ...rest } = filtros
    onChange({ ...rest, pagina: 1 })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-36">
      <h3 className="text-sm font-bold text-gray-900 mb-5">Filtros</h3>

      {/* CEP-based proximity */}
      <FilterGroup label="Busca por proximidade">
        <p className="text-xs text-gray-400 mb-2">Digite seu CEP para ver instrutores que atendem sua região.</p>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={cepInput}
            onChange={e => { setCepInput(e.target.value); setCepError('') }}
            onBlur={handleCepBlur}
            placeholder="00000-000"
            maxLength={9}
            className={`w-full pl-8 pr-8 py-2 rounded-xl border-2 text-xs transition-colors focus:outline-none ${
              filtros.lat ? 'border-green-400 bg-green-50' : 'border-gray-200 focus:border-green-400'
            }`}
          />
          {cepLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin" />
          )}
          {filtros.lat && !cepLoading && (
            <button onClick={clearCep} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs font-bold">✕</button>
          )}
        </div>
        {filtros.lat && (
          <p className="text-xs text-green-600 mt-1.5 font-medium">Localização definida ✓</p>
        )}
        {cepError && (
          <p className="text-xs text-red-500 mt-1.5">{cepError}</p>
        )}
      </FilterGroup>

      <FilterGroup label="Gênero do instrutor">
        <div className="flex flex-wrap gap-2">
          {[
            { val: '', label: 'Todos' },
            { val: 'F', label: 'Mulher' },
            { val: 'M', label: 'Homem' },
          ].map(o => (
            <ChipButton key={o.val} active={filtros.genero === o.val} onClick={() => set('genero', o.val)}>
              {o.label}
            </ChipButton>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Avaliação mínima">
        <div className="flex flex-wrap gap-2">
          {[
            { val: 0, label: 'Qualquer' },
            { val: 4.0, label: '4.0+' },
            { val: 4.5, label: '4.5+' },
            { val: 4.9, label: '4.9+' },
          ].map(o => (
            <ChipButton key={o.val} active={(filtros.avaliacaoMinima ?? 0) === o.val} onClick={() => set('avaliacaoMinima', o.val)}>
              {o.label}
            </ChipButton>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label={`Preço máximo: R$${filtros.precoMaximo ?? 300}/h`}>
        <input
          type="range"
          min={50}
          max={500}
          step={10}
          value={filtros.precoMaximo ?? 300}
          onChange={e => set('precoMaximo', Number(e.target.value))}
          className="w-full accent-green-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>R$50</span>
          <span>R$500</span>
        </div>
      </FilterGroup>

      <FilterGroup label="Distância máxima">
        <div className="flex flex-wrap gap-2">
          {[
            { val: undefined, label: 'Qualquer' },
            { val: 5, label: '5 km' },
            { val: 15, label: '15 km' },
            { val: 30, label: '30 km' },
          ].map(o => (
            <ChipButton key={String(o.val)} active={filtros.distanciaMaximaKm === o.val} onClick={() => set('distanciaMaximaKm', o.val)}>
              {o.label}
            </ChipButton>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Forma de pagamento">
        <div className="flex flex-col gap-2">
          {[
            { val: '', label: 'Qualquer', desc: '' },
            { val: 'PLATAFORMA', label: '💳 Via plataforma', desc: 'Pagamento pelo site' },
            { val: 'DIRETO', label: '🤝 Direto com instrutor', desc: 'Negocia diretamente' },
          ].map(o => (
            <button
              key={o.val}
              onClick={() => set('modoPagamento', o.val)}
              className={`w-full text-left px-3 py-2 rounded-xl border-2 text-xs font-medium transition-colors ${
                (filtros.modoPagamento ?? '') === o.val
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              {o.label}
              {o.desc && <span className="block font-normal text-gray-400 mt-0.5">{o.desc}</span>}
            </button>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup label="Especialidades">
        <div className="flex flex-wrap gap-2">
          {['Iniciantes', 'Baliza', 'Automático', 'Manual', 'Ansiedade', 'Estrada'].map(e => (
            <ChipButton
              key={e}
              active={filtros.especialidades?.includes(e) ?? false}
              onClick={() => {
                const atual = filtros.especialidades ?? []
                const novo = atual.includes(e) ? atual.filter(x => x !== e) : [...atual, e]
                set('especialidades', novo)
              }}
            >
              {e}
            </ChipButton>
          ))}
        </div>
      </FilterGroup>

      <button
        onClick={() => onChange({ ordenacao: 'relevancia', pagina: 1, limite: 12 })}
        className="w-full py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
      >
        Limpar filtros
      </button>
    </div>
  )
}
