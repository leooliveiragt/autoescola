'use client'

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
  function set(key: keyof FiltrosInstrutor, value: any) {
    onChange({ ...filtros, [key]: value, pagina: 1 })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-36">
      <h3 className="text-sm font-bold text-gray-900 mb-5">Filtros</h3>

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
