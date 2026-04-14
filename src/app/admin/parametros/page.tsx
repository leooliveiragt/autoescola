'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2 } from 'lucide-react'

export default function AdminParametrosPage() {
  const [taxa, setTaxa] = useState('10')
  const [mensalidade, setMensalidade] = useState('49')
  const [repasse, setRepasse] = useState('90')
  const [pixChave, setPixChave] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/parametros')
      .then(r => r.json())
      .then(d => {
        if (d.taxa_plataforma) setTaxa(d.taxa_plataforma)
        if (d.mensalidade_instrutor) setMensalidade(d.mensalidade_instrutor)
        if (d.repasse_instrutor) setRepasse(d.repasse_instrutor)
        if (d.pix_chave) setPixChave(d.pix_chave)
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    await fetch('/api/admin/parametros', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taxa_plataforma: taxa, mensalidade_instrutor: mensalidade, repasse_instrutor: repasse, pix_chave: pixChave }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-extrabold mb-2" style={{ fontFamily: 'Plus Jakarta Sans' }}>Parâmetros de cobrança</h1>
      <p className="text-sm text-gray-500 mb-8">Ajuste as taxas e mensalidades da plataforma. As alterações valem para novos cálculos.</p>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Taxa da plataforma (%)</label>
          <p className="text-xs text-gray-400 mb-2">Percentual cobrado sobre cada aula paga via plataforma.</p>
          <div className="flex items-center gap-2">
            <input
              type="number" min="0" max="50" step="0.5"
              value={taxa} onChange={e => setTaxa(e.target.value)}
              className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Repasse ao instrutor (%)</label>
          <p className="text-xs text-gray-400 mb-2">Quanto o instrutor recebe do valor da aula (ex: 90 = instrutor fica com 90%).</p>
          <div className="flex items-center gap-2">
            <input
              type="number" min="50" max="99" step="1"
              value={repasse} onChange={e => setRepasse(e.target.value)}
              className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Mensalidade do instrutor (R$)</label>
          <p className="text-xs text-gray-400 mb-2">Valor cobrado mensalmente do instrutor para manter o perfil ativo.</p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">R$</span>
            <input
              type="number" min="0" step="1"
              value={mensalidade} onChange={e => setMensalidade(e.target.value)}
              className="w-32 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
            />
            <span className="text-sm text-gray-500">/mês</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Chave PIX da plataforma</label>
          <p className="text-xs text-gray-400 mb-2">Chave exibida para os instrutores ao pagar via PIX.</p>
          <input
            type="text"
            value={pixChave} onChange={e => setPixChave(e.target.value)}
            placeholder="email@empresa.com ou CPF/CNPJ"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:outline-none text-sm"
          />
        </div>

        <div className="pt-2 border-t border-gray-100 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 space-y-1">
          <p>💡 <strong>Exemplo com os valores atuais:</strong></p>
          <p>Aula de R$100 → aluno paga <strong>R$100,00</strong> (sem acréscimo)</p>
          <p>Instrutor recebe <strong>R${(100 * Number(repasse)/100).toFixed(2)}</strong> ({repasse}% do valor)</p>
          <p>Plataforma retém <strong>R${(100 * (1 - Number(repasse)/100)).toFixed(2)}</strong> ({(100 - Number(repasse)).toFixed(0)}%)</p>
        </div>

        {saved && <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center font-medium">✓ Parâmetros salvos!</div>}

        <button
          onClick={handleSave} disabled={saving}
          className="w-full py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar parâmetros
        </button>
      </div>
    </div>
  )
}
